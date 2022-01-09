import {BigNumber, ethers} from "ethers";
import {Interface} from "ethers/lib/utils";
import FactoryAbi from "../contracts/abis/uniswap/v3/UniswapV3Factory.json";
import PoolAbi from "../contracts/abis/uniswap/v3/UniswapV3Pool.json";
import {SELECTED_TOKENS} from "../constants";
import {resolveTokenUsdValue} from "./CoinGeckoFunctions";
import {
    defaultProvider,
    fetchErc20MetaData,
    fetchGasFeesOfTransactions,
    getStartBlock,
    web3Provider
} from "./Web3Functions";

//This file contains function which are used to interact with  the Uniswap V3 smart contracts

//Fetch all pools created by the uniswap factory contract.
export const fetchUniswapPools = async () => {
    const UNISWAP_V3_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984"
    //The factory contract itself was deployed at block 12369621. So no need to query blocks before.
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

//Each pools has no a poolInfo field which contains the two tokens the pool includes and its address.
    return pools.map((e) => {
        const {data, topics} = e;
        const {args: {token0, token1, pool}} = iface.parseLog({data, topics});
        return {...e, poolInfo: {token0, token1, poolAddress: pool}}
    })

}

export const getTokenVolumeAndGas = async (selectedTokens) => {
    const poolsWitTokenUsdPrice = await Promise.all(selectedTokens.map(up => resolveTokenUsdValue(up)));

    const poolsWithErc20Token = await Promise.all(poolsWitTokenUsdPrice.map(async p => {
        return await Promise.all(p.map(_resolveTokenNames));
    }))

    const poolsWithTransactions = await Promise.all(poolsWithErc20Token.map(async p => {
        return await Promise.all(p.map(fetchTransactionsFromUniswapPool))
    }))

    const poolsWithGasFeeTransactionsReceipts = await Promise.all(poolsWithTransactions.map(async p => {
        return await Promise.all(p.map(fetchGasFeesOfTransactions))
    }))

    const poolsWithDailyUSDValue = await Promise.all(poolsWithGasFeeTransactionsReceipts.map(async p => {
        return await Promise.all(p.map(_cumulate24HVolumeInUSD))
    }))

    return poolsWithDailyUSDValue;

}


//resolve name,symbol and decimals from both tokens of the pool. This is necessary because the PoolCreated Event only includes the address of the corresponding ERC20 contract.
const _resolveTokenNames = async pool => {
    const {poolInfo: {token0, token1}} = pool;

    const [token0MetaData, token1MetaData] = await Promise.all([fetchErc20MetaData(token0), fetchErc20MetaData(token1)]);

    return {
        ...pool,
        token0: {...token0MetaData,},
        token1: {...token1MetaData,}
    }
}

//Fetches all transactions of the last 24 hours of this pool
export const fetchTransactionsFromUniswapPool = async pool => {
    const toBlock = await web3Provider.getBlockNumber();
    const fromBlock = toBlock - getStartBlock();

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

//Sum up all "Swap" events. Inspired by the uniswap v3 subgraph implementation
const _cumulate24HVolumeInUSD = pool => {
    const swaps = pool.transactions
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


    swaps.amount0 = Number.parseFloat(ethers.utils.formatUnits(swaps.amount0, pool.token0.decimals)) * pool.usd.usdToken0
    swaps.amount1 = Number.parseFloat(ethers.utils.formatUnits(swaps.amount1, pool.token1.decimals)) * pool.usd.usdToken1

    //Divide by two like uniswap subgraph do
    const dailyUSDVolume = (swaps.amount0 + swaps.amount1) / 2


    return {...pool, dailyUSDVolume}

}


//Returns all pools which are including the certain token
export const getAllPoolsOfSelectedToken = (tokenContractAddress, allPools) => {
    const lowercaseContractAddress = tokenContractAddress.toLowerCase();
    return allPools.filter(p => {
            const {poolInfo: {token0, token1}} = p;
            return token0.toLowerCase() === lowercaseContractAddress || token1.toLowerCase() === lowercaseContractAddress
        }
    )
}

//To spare the apis used in this application I decided to show only a few selected token on the dashboard.
export const getPreselectedTokens = async allPools => {
    const selectedTokens = _groupPoolsBasedOnTokens(allPools)
    return await getTokenVolumeAndGas(selectedTokens)
}

const _groupPoolsBasedOnTokens = allPools => {
    return SELECTED_TOKENS.map(t => {
        return getAllPoolsOfSelectedToken(t, allPools)
    })
}



