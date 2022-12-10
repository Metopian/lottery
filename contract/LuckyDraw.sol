// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ISpaceRegistration.sol";

contract LuckyDraw is VRFConsumerBaseV2, ConfirmedOwner, ReentrancyGuard {
    using Counters for Counters.Counter;

    event CreateLottery(uint256 id);
    event Fund(uint256 indexed lotId, uint256 amount);
    event Join(uint256 indexed lotId, address indexed user, uint256 tickets);
    event Claimed(uint256 indexed lotId, address indexed user);

    /**
     * VRF events
     */
    event RequestSent(uint256 lotId);
    event RequestFulfilled(uint256 lotId, uint256[] randomWords);
    
    struct Lottery {
        uint spaceId;
        address creator;

        /**
        * For a non-tokenized random draw, tokenAddr = address(0)
        */
        address tokenAddr;
        uint256 pool;
        uint256 claimed;

        /**
        * winners & winnerRatios:
        * Winners are able to claim the indexed ratios of the pool. Other participants share the rest of the pool;
        * For a generalized giveaway, winners is set 0 and winnerRatios of length 0;
        * For a common lucky draw, sum(winnerRatios) = 100;
        */
        uint32 winners;
        uint256[] winnerRatios;

        /**
        * Users are randomly drawed as winners with the possibilities based on tickets.
        */
        uint256 maxTickets;
        uint256 ticketPrice;
        mapping(address => uint256[]) indexedTickets;
        address[] tickets;

        uint256 vrfRequestId;
        uint256 start;
        uint256 end;
        mapping(address => bool) claimedAddrs;
        Counters.Counter counter;

        /**
        * Signature to msg = abi.encodePacked(lotId, msg.sender)
        */
        bool requireSig;
    }

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
        uint256 lotId;
    }
    Lottery[] lotteries;

    // After life the creator is able to withdraw the remaining pool
    uint256 private life = 30 * 24 * 3600;

    // Signature verification contract if requireSig
    ISpaceRegistration spaceRegistration = ISpaceRegistration(0x6D9e5B24F3a82a42F3698c1664004E9f1fBD9cEA);

    /**
     * VRF settings
     */
    uint64 s_subscriptionId;
    bytes32 keyHash =
        0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;
    uint32 callbackGasLimit = 1000000;
    uint16 requestConfirmations = 3;
    VRFCoordinatorV2Interface COORDINATOR;
    address private vrfCoordinatorAddr = 0xc587d9053cd1118f25F645F9E08BB98c9712A4EE;
        
    mapping(uint256 => RequestStatus) private s_requests;

    constructor(uint64 subscriptionId)
        VRFConsumerBaseV2(vrfCoordinatorAddr)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinatorAddr);
        s_subscriptionId = subscriptionId;
    }

    function create(
        uint spaceId,
        address tokenAddr,
        uint256 maxTickets,
        uint256 ticketPrice,
        uint256[] memory winnerRatios,
        uint32 winners,
        uint256 start,
        uint256 end,
        bool requireSig
    ) public {
        require(end > start && end > block.timestamp, "invalid time");
        require(maxTickets>0, "invalid maxTickets");
        require(winnerRatios.length == winners, "invalid winners");
        if (tokenAddr != address(0)) {
            IERC20 token = IERC20(tokenAddr);
            require(token.totalSupply() > 0, "invalid token");
        }else{
            require(ticketPrice == 0, "invalid token");
        }

        uint256 ratioSum;
        for (uint256 i = 0; i < winners; i++) {
            ratioSum += winnerRatios[i];
        }
        require(ratioSum <= 100, "invalid ratio");

        Lottery storage lot = lotteries.push();
        lot.spaceId = spaceId;
        lot.creator = msg.sender;
        lot.tokenAddr = tokenAddr;
        lot.maxTickets = maxTickets;
        lot.ticketPrice = ticketPrice;
        lot.winnerRatios = winnerRatios;
        lot.winners = winners;
        lot.start = start;
        lot.end = end;
        lot.requireSig = requireSig;

        emit CreateLottery(lotteries.length - 1);
    }

    function fund(uint256 lotId, uint256 amount) public {
        Lottery storage lot = lotteries[lotId];
        require(lot.end > block.timestamp, "invalid time");
        require(lot.tokenAddr != address(0), "invalid token");
        IERC20 token = IERC20(lot.tokenAddr);
        token.transferFrom(msg.sender, address(this), amount);
        lot.pool += amount;

        emit Fund(lotId, amount);
    }

    function join(uint256 lotId, uint256 quantity, bytes memory sig) public {
        Lottery storage lot = lotteries[lotId];
        require(
            lot.start <= block.timestamp && lot.end > block.timestamp,
            "invalid time"
        );
        if(lot.requireSig){
            bytes32 message = keccak256(abi.encodePacked(lotId, msg.sender));
            require(spaceRegistration.verifySignature(lot.spaceId, message, sig), "Sig invalid");
        }

        uint256 currentLen = lot.indexedTickets[msg.sender].length;
        require(
            quantity > 0 && currentLen + quantity <= lot.maxTickets,
            "invalid quantity"
        );

        if(lot.tokenAddr != address(0) && lot.ticketPrice > 0){
            uint256 totalPrice = quantity * lot.ticketPrice;
            IERC20 token = IERC20(lot.tokenAddr);
            token.transferFrom(msg.sender, address(this), totalPrice);
            lot.pool += totalPrice;
            emit Fund(lotId, totalPrice);
        }
        
        uint256[] memory buff = new uint256[](currentLen + quantity);
        // copy current tickets
        for (uint256 i = 0; i < currentLen; i++) {
            buff[i] = lot.indexedTickets[msg.sender][i];
        }
        // add new purchased tickets
        for (uint256 i = 0; i < quantity; i++) {
            buff[currentLen + i] = lot.counter.current();
            lot.tickets.push(msg.sender);
            lot.counter.increment();
        }

        lot.indexedTickets[msg.sender] = buff;
        emit Join(lotId, msg.sender, quantity);
    }

    function draw(uint256 lotId) public {
        Lottery storage lot = lotteries[lotId];
        require(block.timestamp > lot.end, "not available");
        require(lot.vrfRequestId == 0, "drawed");

        lot.vrfRequestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            lot.winners
        );

        s_requests[lot.vrfRequestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false,
            lotId: lotId
        });
        emit RequestSent(lotId);
    }

    function getWinners(uint256 lotId)
        public
        view
        returns (address[] memory result)
    {
        Lottery storage lot = lotteries[lotId];
        if(lot.winners==0){
            return result;
        }
        RequestStatus storage randomRequest = s_requests[lot.vrfRequestId];
        require(randomRequest.fulfilled, "no result");
        result = new address[](lot.winners);
        uint256 currentLen = lot.counter.current();
        for (uint256 i = 0; i < lot.winners; i++) {
            uint256 index = randomRequest.randomWords[i] % currentLen;
            for (uint256 j = 0; j < i; j++) {
                uint256[] storage indexedTickets = lot.indexedTickets[
                    result[j]
                ];
                for (
                    uint256 k = 0;
                    k < indexedTickets.length && indexedTickets[k] <= index;
                    k++
                ) {
                    ++index;
                }
            }

            result[i] = lot.tickets[index];
            currentLen -= lot.indexedTickets[result[i]].length;
        }

        return result;
    }

    function prize(uint256 lotId) public view returns (uint256) {
        Lottery storage lot = lotteries[lotId];
        if (lot.indexedTickets[msg.sender].length == 0 || lot.tokenAddr == address(0) || lot.pool == 0) return 0;
        address[] memory winners = getWinners(lotId);
        uint256 winnerPrizes;
        uint256 winnerTickets;
        for (uint256 i = 0; i < winners.length; i++) {
            if (msg.sender == winners[i]) {
                /**
                * if winner => return
                */
                return (lot.pool * lot.winnerRatios[i]) / 100;
            } else {
                winnerTickets += lot.indexedTickets[winners[i]].length;
                winnerPrizes += (lot.pool * lot.winnerRatios[i]) / 100;
            }
        }
        return
            ((lot.pool - winnerPrizes) *
                lot.indexedTickets[msg.sender].length) /
            (lot.tickets.length - winnerTickets);
    }

    function claim(uint256 lotId) public nonReentrant {
        Lottery storage lot = lotteries[lotId];
        require(
            lot.indexedTickets[msg.sender].length > 0 &&
                !lot.claimedAddrs[msg.sender],
            "invalid user"
        );

        uint256 prizeVal = prize(lotId);
        require(prizeVal > 0 && lot.pool - lot.claimed > prizeVal, "not claimable");

        IERC20 token = IERC20(lot.tokenAddr);
        token.transfer(msg.sender, prizeVal);
        lot.claimed += prizeVal;
        lot.claimedAddrs[msg.sender] = true;

        emit Claimed(lotId, msg.sender);
    }

    function withdraw(uint256 lotId) public onlyOwner {
        Lottery storage lot = lotteries[lotId];
        require(lot.pool - lot.claimed > 0 , "dry");
        require(block.timestamp > lot.end + life || lot.tokenAddr == address(0) , "not available");
        IERC20 token = IERC20(lot.tokenAddr);
        token.transfer(msg.sender, lot.pool - lot.claimed);
        lot.claimed = lot.pool;
    }
    
    function setLife(uint256 _life) external onlyOwner {
        life = (_life);
    }

    function setVrfCoordinator(address addr) public onlyOwner{
        COORDINATOR = VRFCoordinatorV2Interface(addr);
    }

    function setSpaceRegistration(address addr) public onlyOwner{
        spaceRegistration = ISpaceRegistration(addr);
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        require(!s_requests[_requestId].fulfilled, "fulfilled");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(s_requests[_requestId].lotId, _randomWords);
    }

    function getRequestStatus(uint256 _requestId)
        external
        view
        returns (bool fulfilled, uint256[] memory randomWords)
    {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    function tickets(
        uint256 lotId,
        uint256 cursor,
        uint256 length
    ) public view returns (address[] memory) {
        Lottery storage lot = lotteries[lotId];
        require(cursor + length < lot.counter.current(), "invalid len");

        address[] memory res = new address[](length);
        for (uint256 i = cursor; i < cursor + length; i++) {
            res[i] = lot.tickets[i];
        }
        return res;
    }

    function ticketsByUser(uint256 lotId, address addr)
        public
        view
        returns (uint256[] memory)
    {
        return lotteries[lotId].indexedTickets[addr];
    }

    function lottery(uint256 lotId)
        public
        view
        returns (
            uint spaceId,
            address tokenAddr,
            uint256 pool,
            uint256 maxTickets,
            uint256 ticketPrice,
            uint256[] memory winnerRatio,
            uint256 vrfRequestId,
            uint256 start,
            uint256 end,
            uint256 totalTickets,
            uint256 claimed,
            bool requireSig
        )
    {
        Lottery storage lot = lotteries[lotId];
        RequestStatus storage randomRequest = s_requests[lot.vrfRequestId];
        return (
            lot.spaceId,
            lot.tokenAddr,
            lot.pool,
            lot.maxTickets,
            lot.ticketPrice,
            lot.winnerRatios,
            lot.vrfRequestId,
            lot.start,
            lot.end,
            lot.counter.current(),
            lot.claimed,
            lot.requireSig
        );
    }

}
