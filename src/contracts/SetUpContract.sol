// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */

contract SetUp {
    struct Book {
        address testator;
        uint256 afterTime;
        uint256 fromTime;
        address[] tokens;
    }

    mapping(address => Book) books;

    /**
     * @dev Emit event
     * when addWill function is called.
     */
    event WillAdded(
        address indexed heritor,
        address indexed testator,
        uint256 indexed afterTime
    );

    /**
     * @dev Emit event
     * when will is received.
     */
    event WillReceived(address indexed heritor, address indexed testator);

    /**
     * @dev Emit event
     * when will is renounced.
     */
    event WillRenounced(address indexed heritor);

    constructor() {}

    /**
     * @dev Returns will of `account`
     */
    function willOf(address account) public view returns (Book memory) {
        return books[account];
    }

    /**
     * @dev Add Will of `msg.sender`
     */
    function addWill(
        address testator,
        uint256 afterTime,
        address[] memory tokens
    ) public returns (bool) {
        address heritor = msg.sender;
        _addWill(heritor, testator, afterTime, tokens);
        return true;
    }

    /**
     * @dev Add Will
     * emit WillAdded(heritor, testator, afterTime)
     */
    function _addWill(
        address heritor,
        address testator,
        uint256 afterTime,
        address[] memory tokens
    ) internal {
        books[heritor] = Book(testator, afterTime, block.timestamp, tokens);

        emit WillAdded(heritor, testator, afterTime);
    }

    /**
     * @dev Renounce Will of `msg.sender`
     */
    function renounceWill() public returns (bool) {
        address heritor = msg.sender;
        _renounceWill(heritor);
        return true;
    }

    /**
     * @dev Renounce Will
     * emit WillRenounced(heritor)
     */
    function _renounceWill(address heritor) internal {
        books[heritor].fromTime = 0;

        emit WillRenounced(heritor);
    }

    /**
     * @dev Receive heritor's will
     */
    function receiveWill(address heritor) public returns (bool) {
        address testator = msg.sender;
        _receiveWill(heritor, testator);
        return true;
    }

    /**
     * @dev Receive heritor's will
     * emit WillReceived(heritor, testator)
     */
    function _receiveWill(address heritor, address testator) internal {
        require(
            books[heritor].testator == testator,
            "Will: Heritor is not correct."
        );
        require(
            books[heritor].afterTime + books[heritor].fromTime <=
                block.timestamp,
            "Will: Too soon"
        );

        for (uint i = 0; i < books[heritor].tokens.length; i++) {
            IERC20 token = IERC20(books[heritor].tokens[i]);
            uint256 allowedAmount = token.allowance(heritor, address(this));
            require(allowedAmount > 0, "Will: Heritor didn't give allowance.");

            uint256 heritorBalance = token.balanceOf(heritor);
            uint256 availableAmount = heritorBalance > allowedAmount
                ? allowedAmount
                : heritorBalance;
            token.transferFrom(heritor, address(this), availableAmount);
            token.transfer(testator, availableAmount);
        }

        books[heritor].fromTime = 0;

        emit WillReceived(heritor, testator);
    }
}
