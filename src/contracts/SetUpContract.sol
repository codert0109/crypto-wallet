/**
 *Submitted for verification at Etherscan.io on 2022-11-28
*/

// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SetUp {
    mapping(address => bool) onlyMasters;
    mapping(address => bytes[]) pubKeys;
    mapping(address => bytes[]) metadatas;
    uint fee;

    address _contractOwner;

    constructor() {
        _contractOwner = msg.sender;
    }

    modifier onlyMaster() {
        require(onlyMasters[msg.sender], "sender is not master");
        _;
    }

    modifier onlyOwner() {
        require(_contractOwner == msg.sender, "sender is not owner");
        _;
    }

    function setMasters(address master_address) external {
        if(master_address == address(0x0)) {
            onlyMasters[msg.sender] = true;
        } else {
            onlyMasters[master_address] = true;
        }
    }

    function setPubKey(address _address, bytes[] memory _pubKey) external {
        if(pubKeys[_address].length != 0) {
            require(onlyMasters[msg.sender], "Data is set already and sender is not master.");
        }
        pubKeys[_address] = _pubKey;
    }

    function setMetadata(address _address, bytes[] memory _metadata) external {
        if(metadatas[_address].length != 0) {
            require(onlyMasters[msg.sender], "Data is set already and sender is not master.");
        }
        metadatas[_address] = _metadata;
    }

    function getMetadata(address _address) external view returns(bytes[] memory _metadata) {
        return metadatas[_address];
    }

    function setFee(uint new_fee) external onlyOwner {
        fee = new_fee;
    }

}