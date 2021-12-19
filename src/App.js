import React, {useEffect, useState} from 'react';
import {fetchUniswapPools, getUniswapPools} from "./uniswapFunctions";
import {TokenList} from "./components/TokenList/TokenList";
import {Box, Heading} from "@chakra-ui/react";
import {LoadingState} from "./components/TokenList/LoadingState";

const projectId = "b320a1316f5443969acd83344f535650"


function App() {

    const [uniPool, setUniPool] = useState([]);
    const [pools, setPools] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const setupPool = async () => {
            const pools = await fetchUniswapPools();
            setPools(pools)
        }
        setupPool();
    }, [])


    useEffect(() => {
        const fetch = async () => {
            if (pools.length === 0) {
                //No need to fetch if pools are empty
                return
            }
            console.log("start fetching tokens")
            const res = await getUniswapPools(pools);
            //localStorage.setItem("pools", JSON.stringify(res))

            // const store = JSON.parse(localStorage.getItem("pools"))
            //console.log(res)
            //console.log(store)
            setUniPool(res)
            setIsLoading(false)
        }
        fetch();

    }, [pools]);

    return (
        <Box p="16">
            <Heading>Token Value</Heading>
            <Box mt="4">
                {isLoading ? <LoadingState/> : <TokenList tokens={uniPool}/>}
            </Box>
        </Box>

    );
}

export default App;



