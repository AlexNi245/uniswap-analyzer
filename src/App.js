import React, {useEffect, useState} from 'react';
import {fetchUniswapPools} from "./uniswapFunctions";
import {TokenList} from "./components/TokenList/TokenList";
import {Box, Heading} from "@chakra-ui/react";

const projectId = "b320a1316f5443969acd83344f535650"


function App() {

    const [uniPool, setUniPool] = useState([]);
    const [pools, setPools] = useState([]);

    useEffect(() => {
        const setupPool = async () => {
            const pools = await fetchUniswapPools();
            setPools(pools)
        }
        setupPool();
    }, [])


    useEffect(() => {
        const fetch = async () => {
            console.log("start fetching pools")
            // const res = await getUniswapPools(pools);
            const store = JSON.parse(localStorage.getItem("pools"))
            // localStorage.setItem("pools", JSON.stringify(res))
            //console.log(res)
            console.log(store)
            setUniPool(store)
        }
        fetch();

    }, [pools]);

    return (
        <Box p="16">
            <Heading>Token Value</Heading>
            <Box mt="4">
                <TokenList tokens={uniPool}/>
            </Box>
        </Box>

    );
}

export default App;



