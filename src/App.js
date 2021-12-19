import React, {useEffect, useState} from 'react';
import {fetchUniswapPools} from "./uniswapFunctions";
import {TokenList} from "./components/TokenList/TokenList";
import {Box, Heading} from "@chakra-ui/react";
import {LoadingState} from "./components/TokenList/LoadingState";
import {EthPriceContext} from "./context/EthPriceContext";
import {Header} from "./components/Header/Header";
import {TokenSearch} from "./components/TokenSearch/TokenSearch";
import {PoolContext} from "./context/PoolContext";


function App() {

    const [selectedTokens, setSelectedTokens] = useState([]);
    const [allPools, setAllPools] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [currentEthPrice, setCurrentEthPrice] = useState(0);

    useEffect(() => {
        const setupPool = async () => {
            const pools = await fetchUniswapPools();
            setAllPools(pools)
        }
        setupPool();
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
            if (allPools.length === 0) {
                //No need to fetch if pools are empty
                //       return
            }
            console.log("start fetching tokens")
            //const res = await getUniswapPools(pools);
            //localStorage.setItem("pools", JSON.stringify(res))
            const store = JSON.parse(localStorage.getItem("pools"))
            //console.log(res)
            //console.log(store)
            setSelectedTokens(store)
            setIsLoading(false)
        }
        fetch();

    }, [allPools]);

    return (
        <PoolContext.Provider value={allPools}>
            <EthPriceContext.Provider value={currentEthPrice}>
                <Box background="#E8E8E8">
                    <Header/>
                    <Box p="16">
                        <Heading>Token Value</Heading>
                        <Box background="white" p={4} border={1} borderRadius={12} mt={6}>
                            <Box mt="4">
                                {isLoading ? <LoadingState/> : <TokenList tokens={selectedTokens}/>}
                            </Box>
                        </Box>
                        <Box height={24}></Box>
                        <Heading>Search token</Heading>
                        <Box background="white" p={4} border={1} borderRadius={12} mt={6}>
                            <Box mt="4">
                                {isLoading ? <LoadingState/> : <TokenSearch/>}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </EthPriceContext.Provider>
        </PoolContext.Provider>

    );
}

export default App;



