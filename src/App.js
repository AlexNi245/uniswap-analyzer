import React, {useEffect, useState} from 'react';
import {fetchUniswapPools, getUniswapPools} from "./uniswapFunctions";
import {TokenValue} from "./components/TokenValue";

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
            const res = await getUniswapPools(pools);
            console.log(res)
            setUniPool(res)
        }
        fetch();

    }, [pools]);

    return (
        uniPool.map(t => <TokenValue pools={t}/>)
    );
}

export default App;
