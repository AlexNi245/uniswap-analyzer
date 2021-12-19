import React, {useEffect, useState} from 'react';
import {fetchUniswapPools} from "./uniswapFunctions";
import {TokenList} from "./components/TokenList/TokenList";
import {Box, Heading} from "@chakra-ui/react";
import {LoadingState} from "./components/TokenList/LoadingState";
import {EthPriceContext} from "./context/EthPriceContext";
import {Header} from "./components/Header/Header";


function App() {

    const [uniPool, setUniPool] = useState([]);
    const [pools, setPools] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [currentEthPrice, setCurrentEthPrice] = useState(0);

    useEffect(() => {
        const setupPool = async () => {
            const pools = await fetchUniswapPools();
            setPools(pools)
        }
        //setupPool();
    }, [])

    useEffect(() => {
        const fetchCurrentEthPrice = async () => {
            const res = await fetch("https://api.etherscan.io/api?module=stats&action=ethprice");
            const {result: {ethusd}} = await res.json()
            console.log(ethusd)
            setCurrentEthPrice(ethusd)
        }
        fetchCurrentEthPrice()
    }, [])

    useEffect(() => {
        const fetch = async () => {
            if (pools.length === 0) {
                //No need to fetch if pools are empty
                //       return
            }
            console.log("start fetching tokens")
            //const res = await getUniswapPools(pools);
            //localStorage.setItem("pools", JSON.stringify(res))
            const store = JSON.parse(localStorage.getItem("pools"))
            //console.log(res)
            //console.log(store)
            setUniPool(store)
            setIsLoading(false)
        }
        fetch();

    }, [pools]);

    return (
        <EthPriceContext.Provider value={currentEthPrice}>
            <Header/>
            <Box p="16">
                <Heading>Token Value</Heading>
                <Box mt="4">
                    {isLoading ? <LoadingState/> : <TokenList tokens={uniPool}/>}
                </Box>
            </Box>
        </EthPriceContext.Provider>

    );
}

export default App;



