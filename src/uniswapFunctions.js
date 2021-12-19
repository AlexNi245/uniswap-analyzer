import {BigNumber, Contract, ethers} from "ethers";
import {Interface} from "ethers/lib/utils";
import FactoryAbi from "./contracts/abis/uniswap/v3/UniswapV3Factory.json";
import ERC20Abi from "./contracts/abis/erc20.json";
import PoolAbi from "./contracts/abis/uniswap/v3/UniswapV3Pool.json";
import {SELECTED_TOKENS} from "./constants";

const projectId = "b320a1316f5443969acd83344f535650"

export const defaultProvider = new ethers.providers.getDefaultProvider("mainnet", {infura: {projectId,}})
export const web3Provider = new ethers.providers.Web3Provider(window.ethereum);


const getStartBlock = () => {
    //UTC0
    const TWENTY_FOUR_HOURS_IN_SECONDS = 86400;

    const AVG_BLOCK_TIME = 13;
    return Math.ceil(TWENTY_FOUR_HOURS_IN_SECONDS / AVG_BLOCK_TIME)
}

export const fetchUniswapPools = async (start, end) => {
    const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
    const fromBlock = 12369621
    const toBlock = web3Provider.getBlockNumber();

    const iface = new Interface(FactoryAbi);

    const topics = [
        ethers.utils.id("PoolCreated(address,address,uint24,int24,address)")
    ]

    const pools = (await defaultProvider.getLogs({
        fromBlock,
        toBlock,
        address: UNISWAP_V3_FACTORY_ADDRESS,
        topics
    }))


    return pools.map((e) => {
        const {data, topics} = e;
        const {args: {token0, token1, pool}} = iface.parseLog({data, topics});
        return {...e, poolInfo: {token0, token1, poolAddress: pool}}
    })

}


const fetchErc20MetaData = async contractAddress => {
    const tokenContract = new Contract(contractAddress, ERC20Abi, defaultProvider);
    const decimalsPromise = tokenContract.decimals();
    const namePromise = tokenContract.name();
    const symbolPromise = tokenContract.symbol();

    const [name, symbol, decimals] = await Promise.all([namePromise, symbolPromise, decimalsPromise]);

    return {name, symbol, decimals}
}

const resolveTokenNames = async pool => {
    const {poolInfo: {token0, token1}} = pool;

    const [token0MetaData, token1MetaData, usdPrices] = await Promise.all([fetchErc20MetaData(token0), fetchErc20MetaData(token1)]);

    return {
        ...pool,
        token0: {...token0MetaData,},
        token1: {...token1MetaData,}
    }
}
const resolveTokenUsdValue = async pools => {
    const uniqueTokenAddresses = new Set();

    pools.forEach(t => {
        const token0ContractAddress = t.poolInfo.token0.toLowerCase();
        const token1ContractAddress = t.poolInfo.token1.toLowerCase();

        uniqueTokenAddresses.add(token0ContractAddress)
        uniqueTokenAddresses.add(token1ContractAddress)
    });

    const usdValue = await fetchTokensUsdPrice(Array.from(uniqueTokenAddresses))

    return pools.map(p => {
        const token0ContractAddress = p.poolInfo.token0.toLowerCase();
        const token1ContractAddress = p.poolInfo.token1.toLowerCase();

        const usdToken0 = usdValue[token0ContractAddress]?.usd ?? 1;
        const usdToken1 = usdValue[token1ContractAddress]?.usd ?? 1;

        return {...p, usd: {usdToken0, usdToken1}}
    })
}

const fetchTransactionsFromUniswapPool = async (pool) => {
    const toBlock = await web3Provider.getBlockNumber();
    const fromBlock = toBlock - getStartBlock();

    console.log(fromBlock, toBlock)

    const address = pool.poolInfo.poolAddress;
    const res = await defaultProvider.getLogs({
        fromBlock, toBlock,
        address

    })
    const iface = new Interface(PoolAbi);

    const transactions = res.map((e) => {
        const {data, topics} = e;
        const resolvedEvent = iface.parseLog({data, topics});
        return {...e, resolvedEvent}
    })

    return {...pool, transactions}


}

const fetchGasFeesOfTransactions = async pool => {
    const {transactions} = pool;

    const promises = transactions.map(({transactionHash}) => web3Provider.getTransactionReceipt(transactionHash))

    const resolvedPromises = await Promise.all(promises);
    const gasInfo = resolvedPromises.map(({cumulativeGasUsed, effectiveGasPrice, gasUsed}) => (
        {cumulativeGasUsed, effectiveGasPrice, gasUsed}
    ));

    return {...pool, transactions: transactions.map((t, idx) => ({...t, gasInfo: gasInfo[idx]}))}
}

export const cummulateValue = (pool) => {
    const {transactions, poolInfo} = pool
    const swapws = transactions
        .filter(t => t.resolvedEvent.name === "Swap")
        .reduce((agg, r) => {
            let amount0 = BigNumber.from(r.resolvedEvent.args[2])
            let amount1 = BigNumber.from(r.resolvedEvent.args[3])

            if (amount0.lt(BigNumber.from(0))) {
                amount0 = amount0.mul(BigNumber.from(-1))
            }
            if (amount1.lt(BigNumber.from(0))) {
                amount1 = amount1.mul(BigNumber.from(-1))
            }

            const newAmmount0 = agg.amount0.add(amount0)
            const newAmmount1 = agg.amount1.add(amount1)


            return {amount0: newAmmount0, amount1: newAmmount1}

        }, {
            amount0: BigNumber.from(0),
            amount1: BigNumber.from(0)
        })


    swapws.amount0 = Number.parseFloat(ethers.utils.formatUnits(swapws.amount0, pool.token0.decimals)) * pool.usd.usdToken0
    swapws.amount1 = Number.parseFloat(ethers.utils.formatUnits(swapws.amount1, pool.token1.decimals)) * pool.usd.usdToken1

    //Divide by to like uniswap inof did
    const dailyUSDVolume = (swapws.amount0 + swapws.amount1) / 2


    return {...pool, dailyUSDVolume}

}

const fetchTokensUsdPrice = async (address) => {

    const ESCAPE_CHAR = "%2C";

    const contracts = address.reduce((agg, current) => {
        //No need to add escape char before the first address
        if (agg === "") {
            return current
        }
        return agg + ESCAPE_CHAR + current
    }, "")

    const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contracts}&vs_currencies=usd`
    const res = await fetch(url);
    return await res.json();
}

const groupPoolsBasedOnTokens = (allPools) => {
    return SELECTED_TOKENS.map(t => {
        return getAllPoolsOfSelectedToken(t, allPools)
    })
}

export const getAllPoolsOfSelectedToken = (tokenContractAddress, allPools) => {
    const lowercaseContractAddress = tokenContractAddress.toLowerCase();
    return allPools.filter(p => {
            const {poolInfo: {token0, token1}} = p;
            return token0.toLowerCase() === lowercaseContractAddress || token1.toLowerCase() === lowercaseContractAddress
        }
    )
}

export const getPreselectedTokens = async (pools) => {
    console.log("getting preselected tokens")

    const selectedTokens = groupPoolsBasedOnTokens(pools)
    return await getTokens(selectedTokens)
}

export const getTokens = async (selectedTokens) => {
    const poolsWitTokenUsdPrice = await Promise.all(selectedTokens.map(up => resolveTokenUsdValue(up)));

    const poolsWithErc20Token = await Promise.all(poolsWitTokenUsdPrice.map(async p => {
        return await Promise.all(p.map(resolveTokenNames));
    }))

    const poolsWithTransactions = await Promise.all(poolsWithErc20Token.map(async p => {
        return await Promise.all(p.map(fetchTransactionsFromUniswapPool))
    }))

    const poolsWithGasFeeTransactionsReceipts = await Promise.all(poolsWithTransactions.map(async p => {
        return await Promise.all(p.map(fetchGasFeesOfTransactions))
    }))

    const poolsWithDailyUSDValue = await Promise.all(poolsWithGasFeeTransactionsReceipts.map(async p => {
        return await Promise.all(p.map(cummulateValue))
    }))


    return poolsWithDailyUSDValue;

}

