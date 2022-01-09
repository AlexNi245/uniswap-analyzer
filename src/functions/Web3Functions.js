import {Contract, ethers} from "ethers";
import ERC20Abi from "../contracts/abis/erc20.json";

//This file contains functions that are used to interact which smart contracts and the blockchain in general


const projectId = "b320a1316f5443969acd83344f535650"

export const defaultProvider = new ethers.providers.getDefaultProvider("mainnet", {infura: {projectId,}})
export const web3Provider = new ethers.providers.Web3Provider(window.ethereum);


//returns the blocknumber of the block which was created 24h ago
export const getStartBlock = () => {
    //UTC0
    const TWENTY_FOUR_HOURS_IN_SECONDS = 86400;

    const AVG_BLOCK_TIME = 13;
    return Math.ceil(TWENTY_FOUR_HOURS_IN_SECONDS / AVG_BLOCK_TIME)
}

export const fetchErc20MetaData = async contractAddress => {
    const tokenContract = new Contract(contractAddress, ERC20Abi, defaultProvider);
    const decimalsPromise = tokenContract.decimals();
    const namePromise = tokenContract.name();
    const symbolPromise = tokenContract.symbol();

    const [name, symbol, decimals] = await Promise.all([namePromise, symbolPromise, decimalsPromise]);

    return {name, symbol, decimals}
}

export const fetchGasFeesOfTransactions = async pool => {
    const {transactions} = pool;

    const promises = transactions.map(({transactionHash}) => web3Provider.getTransactionReceipt(transactionHash))

    const resolvedPromises = await Promise.all(promises);
    const gasInfo = resolvedPromises.map(({cumulativeGasUsed, effectiveGasPrice, gasUsed}) => (
        {cumulativeGasUsed, effectiveGasPrice, gasUsed}
    ));

    return {...pool, transactions: transactions.map((t, idx) => ({...t, gasInfo: gasInfo[idx]}))}
}
