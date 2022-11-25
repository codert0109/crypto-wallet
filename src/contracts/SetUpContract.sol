// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SetUp {
    mapping(address => mapping(address => bool)) onlyMasters;
    mapping(address => bytes[]) _onlyMaster;
    mapping(address => bytes) _metadata;
    uint fee;

    address _contractOwner;

    constructor() {
        _contractOwner = msg.sender;
    }

    modifier onlyMaster(address owner) {
        require(onlyMasters[owner][msg.sender], "sender is not master");
        _;
    }

    modifier onlyOwner(address owner) {
        require(_contractOwner == owner, "sender is not owner");
        _;
    }

    function setMaster(address owner, bytes memory pkeys) external onlyMaster(owner) {
        require(pkeys != 0x0000, "");
       _onlyMaster[msg.sender] = pkeys;

    }

    function setMetadata(bytes memory metadata) external {
        _metadata[msg.sender] = metadata;
    }

    function getMetadata() external returns(bytes memory metadata) {
        return _metadata[msg.sender];
    }
}
