pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestToken is ERC20 {
    

    constructor() ERC20("Test Token", "TT"){
        _mint(msg.sender, 10000 * 10e18);
    }

    function mint() public {
        _mint(msg.sender, 10000 * 10e18);
    }   

}