pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    constructor() ERC20("Test Token", "TT"){
        _mint(msg.sender, 100000);
    }

    function mint() public {
        _mint(msg.sender, 100000);
    }   

    function decimals() public view override returns (uint8) {
        return 0;
    }
}