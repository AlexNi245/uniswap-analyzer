import React, {useEffect} from 'react';
import {getUniswapPools} from "./uniswapFunctions";

const projectId = "b320a1316f5443969acd83344f535650"

function App() {
    useEffect(() => {
        getUniswapPools(0, 2);
    }, [getUniswapPools]);

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
