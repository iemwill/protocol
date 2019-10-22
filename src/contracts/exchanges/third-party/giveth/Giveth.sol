pragma solidity ^0.4.25;

contract Giveth {

  // @notice Just some global used stuff.
	mapping (address => mapping (address => uint)) public donations;
	address public givethBridge;
	uint64 public _receiverDAC;


	// @notice If _token = address(0), this means the token is ether itself.
	event donated(address _donator,address _token, uint _amount);

	// @notice These values are for the Testnet-Setup.(Ropsten) 
	constructor () public {
		givethBridge = 0x279277482F13aeF92914317a0417DD591145aDc9;
		_receiverDAC = uint64(127);
	}
	
	//@notice Just sending Ether to this Contract forwards the sended Amount to the givethDAC.
    function () 
    public payable{
    	donateETH();
    }
    
    //@notice This function sends Ethereum to the implemented Giveth DAC.
    function donateETH ()
    public payable {
    	uint val = msg.value;
    	address sender = msg.sender;

    	require (val > 0,
    		"There is nothing to donate.");
    	
        require(givethBridge.call.value(address(this).balance).gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64)",
            sender,
            _receiverDAC
            )),
        "Donation wasn't successfull. Please try again.");
        donations[address(0x0)][sender] += val;
        emit donated(sender,address(0x0), val);
    }

    //@notice This function makes it possible to send ERC20 token to the implemented Giveth DAC.
    function donateAsset (
    	address _makerAsset,
        uint _makerQuantity
        )
    public {
    	address sender = msg.sender;
        require(givethBridge.delegatecall.gas(30000)(abi.encodeWithSignature(
            "donateAndCreateGiver(address,uint64,address,uint)",
            sender,
            _receiverDAC,
            _makerAsset,
            _makerQuantity
            )),
        "Donation wasn't successfull. Please try again.");
        donations[_makerAsset][sender] += _makerQuantity;
        emit donated(sender, address(_makerAsset), _makerQuantity);
    }

    //@notice This function shows the donated value of _asset from donator _from.
    function showDonations (
    	address _from,
    	address _asset
    	) 
    public view returns(uint value){
    	return donations[_asset][_from];
    }
}
