import React, {useEffect} from 'react';
import {BigNumber, Contract, ethers} from "ethers";
import {Interface} from "ethers/lib/utils";
import PoolAbi from "./contracts/abis/uniswap/v3/UniswapV3Pool.json"
import FactoryAbi from "./contracts/abis/uniswap/v3/UniswapV3Factory.json"
import ERC20Abi from "./contracts/abis/erc20.json"

const projectId = "b320a1316f5443969acd83344f535650"

function App() {
    const defaultProvider = new ethers.providers.getDefaultProvider("mainnet", {infura: {projectId,}})
    // const defaultProvider = new ethers.providers.getDefaultProvider()
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);

    const getStartBlock = () => {
        //UTC0
        const TWENTY_FOUR_HOURS_IN_SECONDS = 86400;

        const AVG_BLOCK_TIME = 13;
        return Math.ceil(TWENTY_FOUR_HOURS_IN_SECONDS / AVG_BLOCK_TIME)
    }

    const fetchUniswapPools = async () => {
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
            .slice(0, 2)


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

        const [name, symbol, decimals] = await Promise.all([decimalsPromise, namePromise, symbolPromise]);

        return {name, symbol, decimals}
    }

    const resolveTokenNames = async pool => {
        const {poolInfo: {token0, token1}} = pool;

        const [token0MetaData, token1MetaData, usdPrices] = await Promise.all([fetchErc20MetaData(token0), fetchErc20MetaData(token1), fetchTokensUsdPrice([token0, token1])]);

        return {
            ...pool,
            token0: {...token0MetaData, usd: usdPrices.token0},
            token1: {...token1MetaData, usd: usdPrices.token1}
        }
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

    const cummulateValue = (pool) => {
        const {transactions, poolInfo} = pool

        const token0 = poolInfo.token0;
        const token1 = poolInfo.token1;

        const swapws = transactions
            .filter(t => t.resolvedEvent.name === "Swap")
            .reduce((agg, r) => {
                let amount0 = BigNumber.from(r.resolvedEvent.args["amount0"])
                let amount1 = BigNumber.from(r.resolvedEvent.args["amount1"])

                if (amount0.lt(BigNumber.from(0))) {
                    amount0 = amount0.add(amount0.mul(BigNumber.from(-1)))
                }
                if (amount1.lt(BigNumber.from(0))) {
                    amount1 = amount1.add(amount1.mul(BigNumber.from(-1)))
                }

                agg.amount0 = agg.amount0.add(amount0)
                agg.amount1 = agg.amount1.add(amount1)

                return agg
            }, {
                amount0: BigNumber.from(0),
                amount1: BigNumber.from(0)
            })

        swapws.amount0 = Number.parseFloat(ethers.utils.formatUnits(swapws.amount0, token0.decimals)) * pool.token0.usd
        swapws.amount1 = Number.parseFloat(ethers.utils.formatUnits(swapws.amount1, token1.decimals)) * pool.token1.usd

        return swapws.amount0 + swapws.amount1
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
        const json = await res.json()


        return {
            token0: json[address[0].toLowerCase()].usd,
            token1: json[address[1].toLowerCase()].usd
        }
    }


    useEffect(() => {
        assemble();
    })

    const assemble = async () => {
        console.log("start assembeling")
        const pools = await fetchUniswapPools();
        const resolvedPools = await Promise.all(pools.map(resolveTokenNames));
        console.log(resolvedPools)
        const transactionPromises = await Promise.all(resolvedPools.map(fetchTransactionsFromUniswapPool))
        console.log(transactionPromises)
        const gasFeePromises = await Promise.all(transactionPromises.map(fetchGasFeesOfTransactions))

        const transactionWithCummulatedValue = gasFeePromises.map(cummulateValue)

        console.log(gasFeePromises)
        console.log(transactionWithCummulatedValue)


    }

    return (

        // <ChakraProvider theme={theme}>
        //     <Box padding="24">
        //     <h1>Daily Trade Volume</h1>
        //     <TradeVolume/>
        //     </Box>
        // </ChakraProvider>
        <p>Hi</p>
    );
}

export default App;
