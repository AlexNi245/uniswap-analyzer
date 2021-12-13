import React from 'react';
import {
    ChakraProvider,
    Box,
    Text,
    Link,
    VStack,
    Code,
    Grid,
    theme,
} from '@chakra-ui/react';
import {ColorModeSwitcher} from './ColorModeSwitcher';
import {Logo} from './Logo';
import {TradeVolume} from "./components/TradeVolume";

function App() {
    return (
        <ChakraProvider theme={theme}>
            <Box padding="24">
            <h1>Daily Trade Volume</h1>
            <TradeVolume/>
            </Box>
        </ChakraProvider>
    );
}

export default App;
