// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

library Balances {
    function move(
        mapping(address => uint256) storage balances,
        address from,
        address to,
        uint256 amount
    ) internal {
        require(balances[from] >= amount);
        require(balances[to] + amount >= balances[to]);
        balances[from] -= amount;
        balances[to] += amount;
    }
}

contract Transaction {
    uint256 numTransaction;
    mapping(address => uint256) balances;
    mapping(address => uint256) numTransactions;
    mapping(uint256 => bool) onlyRelayer;
    mapping(address => mapping (address => uint256)) allowed;
    uint256 fee;
    uint256 RevertAfter;

    address public _contractOwner;

    using Balances for *;

    event Transfer(address from, address to, uint256 amount);
    event Approval(address owner, address spender, uint256 amount);

    modifier onlyOwner() {
        require(_contractOwner == msg.sender, "sendder is not contract owner.");
        _;
    }

    constructor() {
        _contractOwner = msg.sender;
    }

    function setFee(uint newFee) external onlyOwner {
        fee = newFee;
    }

    function setRevertAfter(uint newRevertAfter) external onlyOwner {
        RevertAfter = newRevertAfter;
    }

    function transfer(address to, uint256 amount)
        external
        returns (bool success)
    {
        balances.move(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount);
        numTransaction++;
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool success) {
        require(allowed[from][msg.sender] >= amount);
        allowed[from][msg.sender] -= amount;
        balances.move(from, to, amount);
        emit Transfer(from, to, amount);
        numTransaction++;
        return true;
    }

    function approve(address spender, uint256 tokens)
        external
        returns (bool success)
    {
        require(allowed[msg.sender][spender] == 0, "");
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function balanceOf(address tokenOwner)
        external
        view
        returns (uint256 balance)
    {
        return balances[tokenOwner];
    }
}
