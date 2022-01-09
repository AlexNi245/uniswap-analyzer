//This file contains functions that are used to interact which the CoinGecko Api to fetch the USD Price of a certain ERC20 token

export const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});


/** assembles a list of unique ERC20 contract addresses which prices are then resolved with  {@link _fetchTokensUsdPrice}
 * @param {array} pools a list of uniswap pools
 */
export const resolveTokenUsdValue = async pools => {
    const uniqueTokenAddresses = new Set();

    pools.forEach(t => {
        const token0ContractAddress = t.poolInfo.token0.toLowerCase();
        const token1ContractAddress = t.poolInfo.token1.toLowerCase();

        uniqueTokenAddresses.add(token0ContractAddress)
        uniqueTokenAddresses.add(token1ContractAddress)
    });

    const usdValue = await _fetchTokensUsdPrice(Array.from(uniqueTokenAddresses))

    return pools.map(p => {
        const token0ContractAddress = p.poolInfo.token0.toLowerCase();
        const token1ContractAddress = p.poolInfo.token1.toLowerCase();

        const usdToken0 = usdValue[token0ContractAddress]?.usd ?? 1;
        const usdToken1 = usdValue[token1ContractAddress]?.usd ?? 1;

        return {...p, usd: {usdToken0, usdToken1}}
    })
}

/** Uses the API of coingecko to fetch the USD price of a corresponding token
 * @param {array} addresses a list of ERC20 contract addresses
 */
const _fetchTokensUsdPrice = async (addresses) => {

    const ESCAPE_CHAR = "%2C";

    const contracts = addresses.reduce((agg, current) => {
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
