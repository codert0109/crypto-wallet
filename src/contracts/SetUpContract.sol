// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SetUp {
    mapping(address => bool) onlyMasters;
    mapping(address => bytes[]) public_key_hash;
    mapping(address => bytes[]) metadata;
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

    function setPublicKeyHash(address _address, bytes[] memory pkey) external onlyMaster {
        public_key_hash[_address] = pkey;
    }

    function setMetadata(bytes[] memory _metadata) external onlyOwner {
        metadata[msg.sender] = _metadata;
    }

    function getMetadata() external view returns(bytes[] memory _metadata) {
        return metadata[msg.sender];
    }

    function setFee(uint new_fee) external onlyOwner {
        fee = new_fee;
    }

}
