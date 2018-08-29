pragma solidity ^0.4.21;


import "./Fee.sol";
import "../hub/Spoke.sol";

/// @notice Manages and allocates fees for a particular fund
contract FeeManager is Spoke {

    Fee[] public fees;

    function register(address feeAddress) public {
        fees.push(Fee(fee));
    }

    function batchRegister(address[] feeAddresses) public {
        for (uint i = 0; i < feeAddresses.length; i++) {
            register(feeAddresses[i]);
        }
    }

    /// @dev May modify state of Fees
    function calculateTotalFees() public returns (uint total) {
        for (uint i = 0; i < fees.length; i++) {
            total = add(total, fees[i].calculate(hub));
        }
        return total;
    }

    // TODO: check the fee is registered
    function rewardFee(Fee fee) public {
        uint rewardShares = fee.calculate(hub);
        hub.shares.createFor(hub.manager, rewardShares);
    }
}

