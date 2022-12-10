pragma solidity ^0.8.17;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TestNFT is ERC721 {

    using Counters for Counters.Counter;
    Counters.Counter counter;
    constructor() ERC721("Test Token", "TT"){
        _mint(msg.sender, 1);
        counter.increment();
    }

    function mint() public {
        counter.increment();
        _mint(msg.sender, counter.current());
    }   

}