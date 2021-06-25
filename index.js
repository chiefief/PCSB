require("dotenv").config();
const Web3 = require('web3');
const ethers = require('ethers');
var BigNumber = require('big-number');

const { BSC_RPC_URL, BSC_RPC_URL_WSS, WALLET_PRIVATE_KEY, RECEIVE_WALLET_ADDRESS, SELL_TOKEN_ADDRESS, BUY_TOKEN_ADDRESS, SELL_TOKEN_AMOUNT, GAS, SWAP_CONTRACT_ABI, TOKEN_CONTRACT_ABI, PANCAKE_ROUTER_ADDRESS, PANCAKE_FACTORY_ADDRESS, SWAP_CONTRACT_ADDRESS } = require('./config.js');


var add = BSC_RPC_URL_WSS;

SELL_TOKEN_ADDRESS = SELL_TOKEN_ADDRESS.toLowerCase(); //Token to sell
const SELL_TOKEN_ID = SELL_TOKEN_ADDRESS.substring(2, 42);
BUY_TOKEN_ADDRESS = BUY_TOKEN_ADDRESS.toLowerCase(); //token to buy. Same as TokenID but don't remove 0x for sniping. Use any other for testing.
const BUY_TOKEN_ID = BUY_TOKEN_ADDRESS.substring(2, 42);

const defaultProvider = new Web3(new Web3.providers.HttpProvider(BSC_RPC_URL));
let signer = defaultProvider.eth.accounts.privateKeyToAccount(WALLET_PRIVATE_KEY);

const SELL_WALLET_ADDRESS = signer.address;

var amountIn = SELL_TOKEN_AMOUNT; // token amount to buy
var gasPrice = GAS;

const router = new defaultProvider.eth.Contract(
	SWAP_CONTRACT_ABI,
    SWAP_CONTRACT_ADDRESS
    // [
    //     'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
    //     'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
    // ],
    // signer
);

var web3 = new Web3(add);

let SELL_TOKEN_ABI = [
       // balanceOf
       {
         "constant":true,
         "inputs":[{"name":"_owner","type":"address"}],
         "name":"balanceOf",
         "outputs":[{"name":"balance","type":"uint256"}],
         "type":"function"
       },
       // decimals
       {
         "constant":true,
         "inputs":[],
         "name":"decimals",
         "outputs":[{"name":"","type":"uint8"}],
         "type":"function"
       }
     ];

let sellTokenContract = new web3.eth.Contract(SELL_TOKEN_ABI, SELL_TOKEN_ADDRESS);

let amountInString = "";
sellTokenContract.methods.balanceOf(SELL_WALLET_ADDRESS).call().then((balance) => {
	let amountInMax = balance;
	
	sellTokenContract.methods.decimals().call().then((decimals) => {
		if (amountInMax < amountIn * (10 ** decimals)) {
			console.log("Sell token is less than needed amount. Please check again and rerun...");
			return;
		}
		amountInString = (amountIn * (10 ** decimals)).toString();
	});

});

///  Approve token ///
let buyTokenContract = new web3.eth.Contract(TOKEN_CONTRACT_ABI, BUY_TOKEN_ADDRESS);

let tokenTotalSupply = "";
buyTokenContract.methods.totalSupply().call().then((totalSupply) => {
	tokenTotalSupply = totalSupply;

	var approveTX ={
			from: SELL_WALLET_ADDRESS,
			to: BUY_TOKEN_ADDRESS,
			gas: 50000,
			gasPrice: "5000000000",
			data: buyTokenContract.methods.approve(RECEIVE_WALLET_ADDRESS, totalSupply).encodeABI()
		}

	var approveSignedTX = await signer.signTransaction(approveTX);
	var approveResult = await web3.eth.sendSignedTransaction(approveSignedTX.rawTransaction);
});

let addLiquidityMethodId = "0xe8e33700";
let addLiquidityETHMethodId = "0xf305d719";

const subscription = web3.eth.subscribe('pendingTransactions', (err, res) => {
	if (err) console.error(err);
});

subscription.on('data', (txHash) => {
	setTimeout(async () => {
		try {
			let tx = await web3.eth.getTransaction(txHash);
			
			if (tx == null) {
				return;
			}

			if (tx.input) {
				if (tx['to'] && tx['to'].toLowerCase() == PANCAKE_ROUTER_ADDRESS) {
					
	    			if ((tx['input'].includes(addLiquidityMethodId) && tx['input'].includes(BUY_TOKEN_ID) && tx['input'].includes(SELL_TOKEN_ID)) || (tx['input'].includes(addLiquidityETHMethodId) && tx['input'].includes(BUY_TOKEN_ID))) {
						
        				console.log("Detect addLiquidity!!!");
      					console.log("type 1");

      					if ("_tradingEnabled" in buyTokenContract.methods) {
      						buyTokenContract.methods._tradingEnabled().call().then((_tradingEnabled) => {
      							if (!_tradingEnabled) {
      								console.log("Transaction Disabled Now");
      								return;
      							}
      						}
      					}

      					let maxTxAmount = '0';
						if ("_maxTxAmount" in buyTokenContract.methods) {
							buyTokenContract.methods._maxTxAmount().call().then((_maxTxAmount) => {
								maxTxAmount = _maxTxAmount;
							});
						} else if ("_getMaxTxSize" in buyTokenContract.methods) {
							buyTokenContract.methods._getMaxTxSize().call().then((_maxTxAmount) => {
								maxTxAmount = _maxTxAmount;
							});
						}

      //   				var deadline = 0;
      //   				await web3.eth.getBlock('latest', (error, block) => {
						//     deadline = block.timestamp + 1000 * 60 * 20; // transaction expires in 300 seconds (5 minutes)
						// });

        				let result = router.methods.swapExactTokensForTokens(
        					amountInString,
        					'0',
        					[SELL_TOKEN_ADDRESS, BUY_TOKEN_ADDRESS],
				            RECEIVE_WALLET_ADDRESS,
				            maxTxAmount
				          );

        				const trans = {
							  from: SELL_WALLET_ADDRESS, 
							  to: PANCAKE_ROUTER_ADDRESS, 
							  gas: tx.gas, 
							  gasPrice: (gasPrice * 10**9).toString(),
							  value: amountInString,
							  data: result.encodeABI() 
							};

						const signedTx = await signer.signTransaction(trans);

						await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
						.on('transactionHash', function(hash){
					        console.log('transactionHash : ', hash);
					    })
					    .on('confirmation', function(confirmationNumber, receipt){
					        console.log("transaction is done");
					    })
					    .on('receipt', function(receipt){
					    	console.log("Transaction receipt: ", receipt);
					    })
					    .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					        console.log('Attack failed: ', error)
					    });
					}
		    //     	} else if (tx['input'].includes(addLiquidityETHMethodId) && tx['input'].includes(BUY_TOKEN_ID)) {//addLiquidityETH

			   //  			// let addedToken = '0x' + (params[0].substring(24, 64));
      //   				console.log("Detect addLiquidity!!!");
      //   				console.log("type 2");

      //   				let maxTxAmount = '0';
						// if ("_maxTxAmount" in buyTokenContract.methods) {
						// 	buyTokenContract.methods._maxTxAmount().call().then((_maxTxAmount) => {
						// 		maxTxAmount = _maxTxAmount;
						// 	});
						// } else if ("_getMaxTxSize" in buyTokenContract.methods) {
						// 	buyTokenContract.methods._getMaxTxSize().call().then((_maxTxAmount) => {
						// 		maxTxAmount = _maxTxAmount;
						// 	});
						// }

      //   				let result = router.methods.swapExactETHForTokens(
      //   					amountInString,
      //   					'0',
      //   				 	[SELL_TOKEN_ADDRESS, BUY_TOKEN_ADDRESS],
				  //           RECEIVE_WALLET_ADDRESS,
				  //           maxTxAmount
				  //         );
        				
      //   				const trans = {
						// 	  from: SELL_WALLET_ADDRESS, 
						// 	  to: PANCAKE_ROUTER_ADDRESS, 
						// 	  gas: tx.gas, 
						// 	  gasPrice: (gasPrice * 10**9).toString(),
						// 	  value: amountInString,
						// 	  data: result.encodeABI() 
						// 	};

						// const signedTx = await signer.signTransaction(trans);

						// await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
						// .on('transactionHash', function(hash){
					 //        console.log('transactionHash : ', hash);
					 //    })
					 //    .on('confirmation', function(confirmationNumber, receipt){
					 //        console.log("transaction is done");
					 //    })
					 //    .on('receipt', function(receipt){
					 //    	console.log("Transaction receipt: ", receipt);
					 //    })
					 //    .on('error', function(error, receipt) {
					 //        console.log('Attack failed: ', error)
					 //    });
	     //    		}
				}
			}
		} catch (err) {
			console.error(err);
		}
	})
});

function parseTx(input) {
    if (input == '0x') {
        return ['0x', []]
    }
    if ((input.length - 8 - 2) % 64 != 0) {
        throw "Data size misaligned with parse request."
    }
    let method = input.substring(0, 10);
    let numParams = (input.length - 8 - 2) / 64;
    var params = [];
    for (i = 0; i < numParams; i += 1) {
        let param = (input.substring(10 + 64 * i, 10 + 64 * (i + 1))).toString(16);
        params.push('0x' + param.substring(24, 64));
    }
    return [method, params]
}