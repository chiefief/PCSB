const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org:443';
const BSC_RPC_URL_WSS = 'wss://bsc-ws-node.nariox.org:443';

const WALLET_PRIVATE_KEY = "";
const RECEIVE_WALLET_ADDRESS = "0x80AC1437c39cD98ad716FCB6dCBbd8C1977B7d42";

const SELL_TOKEN_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"; // WBNB
const BUY_TOKEN_ADDRESS="";

const SWAP_CONTRACT_ADDRESS="0x82E52fe0e41e762A39185eE49b8300e5bDabbAd6";
const SELL_TOKEN_AMOUNT=0.01;
const GAS=20;

const SWAP_CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"geUnlockTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityPair","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"time","type":"uint256"}],"name":"lock","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pancakeFactory","outputs":[{"internalType":"contract IPancakeFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pancakeRouter","outputs":[{"internalType":"contract IPancakeRouter02","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"maxTxAmount","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unlock","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const TOKEN_CONTRACT_ABI=;

const PANCAKE_ROUTER_ADDRESS = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const PANCAKE_FACTORY_ADDRESS = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';

module.exports = {
	BSC_RPC_URL,
	BSC_RPC_URL_WSS,
	WALLET_PRIVATE_KEY,
	RECEIVE_WALLET_ADDRESS,
    SELL_TOKEN_ADDRESS,
    BUY_TOKEN_ADDRESS,
    SELL_TOKEN_AMOUNT,
    GAS,
    SWAP_CONTRACT_ABI,
    TOKEN_CONTRACT_ABI,
    PANCAKE_ROUTER_ADDRESS,
    PANCAKE_FACTORY_ADDRESS,
    SWAP_CONTRACT_ADDRESS
}