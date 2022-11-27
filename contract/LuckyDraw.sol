// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LuckyDraw is VRFConsumerBaseV2, ConfirmedOwner, ReentrancyGuard {
    using Counters for Counters.Counter;

    event RequestSent(uint256 lotId);
    event RequestFulfilled(uint256 lotId, uint256[] randomWords);

    event CreateLottery(uint256 id);
    event Fund(uint256 indexed lotId, uint256 amount);
    event Join(uint256 indexed lotId, address indexed user, uint256 tickets);
    event Claimed(uint256 indexed lotId, address indexed user);

    struct Lottery {
        address creator;
        address tokenAddr;
        uint256 pool;
        uint256 claimed;
        uint256 maxTickets;
        uint256 ticketPrice;
        // Reward ratio to the pool for each winner. Other participants share the rest of the pool.
        uint256[] winnerRatios;
        uint32 winners;
        mapping(address => uint256[]) indexedTickets;
        address[] tickets;
        uint256 vrfRequestId;
        uint256 start;
        uint256 end;
        mapping(address => bool) claimedAddrs;
        Counters.Counter counter;
    }

    // After life the creator is able to withdraw the remaining pool
    uint256 life = 30 * 24 * 3600;

    function setLife(uint256 _life) external onlyOwner {
        life = (_life);
    }

    uint64 s_subscriptionId;
    mapping(uint256 => uint256) requestMap;

    bytes32 keyHash =
        0xd4bb89654db74673a187bd804519e65e3f71a52bc55f11da7601a13dcf505314;
    uint32 callbackGasLimit = 1000000;
    uint16 requestConfirmations = 3;
    Lottery[] lotteries;

    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
        uint256 lotId;
    }
    mapping(uint256 => RequestStatus) private s_requests; /* requestId --> requestStatus */

    VRFCoordinatorV2Interface COORDINATOR;

    constructor(uint64 subscriptionId)
        VRFConsumerBaseV2(0x6A2AAd07396B36Fe02a22b33cf443582f682c82f)
        ConfirmedOwner(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x6A2AAd07396B36Fe02a22b33cf443582f682c82f
        );
        s_subscriptionId = subscriptionId;
    }

    function createLottery(
        address tokenAddr,
        uint256 maxTickets,
        uint256 ticketPrice,
        uint256[] memory winnerRatios,
        uint32 winners,
        uint256 start,
        uint256 end
    ) public {
        require(end > start && end > block.timestamp, "invalid time");
        require(
            winnerRatios.length == winners && winners > 0,
            "invalid params"
        );
        IERC20 token = IERC20(tokenAddr);
        require(token.totalSupply() > 0, "invalid token");
        uint256 ratioSum;
        for (uint256 i; i < winners; i++) {
            ratioSum += winnerRatios[i];
        }
        require(ratioSum < 100, "invalid ratio");

        Lottery storage lot = lotteries.push();
        lot.creator = msg.sender;
        lot.tokenAddr = tokenAddr;
        lot.maxTickets = maxTickets;
        lot.ticketPrice = ticketPrice;
        lot.winnerRatios = winnerRatios;
        lot.winners = winners;
        lot.start = start;
        lot.end = end;

        emit CreateLottery(lotteries.length - 1);
    }

    function fund(uint256 lotId, uint256 amount) public {
        Lottery storage lot = lotteries[lotId];
        require(lot.end > block.timestamp, "invalid time");
        IERC20 token = IERC20(lot.tokenAddr);
        token.transferFrom(msg.sender, address(this), amount);
        lot.pool += amount;

        emit Fund(lotId, amount);
    }

    function join(uint256 lotId, uint256 quantity) public {
        Lottery storage lot = lotteries[lotId];
        require(
            lot.start < block.timestamp && lot.end > block.timestamp,
            "invalid time"
        );
        uint256 currentLen = lot.indexedTickets[msg.sender].length;
        require(
            quantity > 0 && currentLen + quantity <= lot.maxTickets,
            "invalid quantity"
        );

        uint256[] memory buff = new uint256[](currentLen + quantity);

        IERC20 token = IERC20(lot.tokenAddr);
        uint256 totalPrice = quantity * lot.ticketPrice;
        token.transferFrom(msg.sender, address(this), totalPrice);
        // copy
        for (uint256 i = 0; i < currentLen; i++) {
            buff[i] = lot.indexedTickets[msg.sender][i];
        }
        // new purchase
        for (uint256 i = 0; i < quantity; i++) {
            buff[currentLen + i] = lot.counter.current();
            lot.tickets.push(msg.sender);
            lot.counter.increment();
        }

        lot.indexedTickets[msg.sender] = buff;
        lot.pool += totalPrice;
        emit Fund(lotId, totalPrice);
        emit Join(lotId, msg.sender, quantity);
    }

    function myTickets(uint256 lotId) public view returns (uint256[] memory) {
        return lotteries[lotId].indexedTickets[msg.sender];
    }

    function lottery(uint256 lotId)
        public
        view
        returns (
            address tokenAddr,
            uint256 pool,
            uint256 maxTickets,
            uint256 ticketPrice,
            uint256[] memory winnerRatio,
            uint32 winners,
            uint256 vrfRequestId,
            uint256 start,
            uint256 end,
            uint256 totalTickets,
            uint256 claimed,
            bool vrfRequestExists
        )
    {
        Lottery storage lot = lotteries[lotId];
        RequestStatus storage randomRequest = s_requests[lot.vrfRequestId];
        return (
            lot.tokenAddr,
            lot.pool,
            lot.maxTickets,
            lot.ticketPrice,
            lot.winnerRatios,
            lot.winners,
            lot.vrfRequestId,
            lot.start,
            lot.end,
            lot.counter.current(),
            lot.claimed,
            randomRequest.exists
        );
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

    function winners(uint256 lotId)
        public
        view
        returns (address[] memory result)
    {
        Lottery storage lot = lotteries[lotId];
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
        if (lot.indexedTickets[msg.sender].length == 0) return 0;
        address[] memory winners = winners(lotId);
        uint256 winnerPrizes;
        uint256 winnerTickets;
        for (uint256 i = 0; i < winners.length; i++) {
            if (msg.sender == winners[i]) {
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
        require(lot.pool - lot.claimed > prizeVal, "unavailable");

        IERC20 token = IERC20(lot.tokenAddr);
        token.transfer(msg.sender, prizeVal);
        lot.claimed += prizeVal;
        lot.claimedAddrs[msg.sender] = true;

        emit Claimed(lotId, msg.sender);
    }

    function withdraw(uint256 lotId) public onlyOwner nonReentrant {
        Lottery storage lot = lotteries[lotId];
        require(block.timestamp > lot.end + life, "not available");

        IERC20 token = IERC20(lot.tokenAddr);
        token.transfer(msg.sender, lot.pool - lot.claimed);
        lot.claimed = lot.pool;
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
}
