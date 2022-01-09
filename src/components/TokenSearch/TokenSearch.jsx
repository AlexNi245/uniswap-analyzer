import React, {useContext, useState} from "react"
import {Box, Button, Flex, Heading, Input} from "@chakra-ui/react";
import {Contract} from "ethers";
import ERC20Abi from "../../contracts/abis/erc20.json";
import {TokenDetails} from "../TokenDetails/TokenDetails";
import {PoolContext} from "../../context/PoolContext";
import {defaultProvider} from "../../functions/Web3Functions";
import {getAllPoolsOfSelectedToken, getTokenVolumeAndGas} from "../../functions/UniswapFunctions";

export const TokenSearch = () => {

    const allPools = useContext(PoolContext)

    const [input, setInput] = useState("")

    const [error, setError] = useState(false)

    const [loading, setLoading] = useState(false)

    const [pools, setPools] = useState([])
    const [name, setName] = useState("")

    const fetchTokenFromUniswap = async () => {
        setLoading(true)
        setError(false)
        setPools([])
        try {
            const tokenContract = new Contract(input, ERC20Abi, defaultProvider);
            const name = await tokenContract.name();
            setName(name)
            console.log(name)
            const tokenPools = await getAllPoolsOfSelectedToken(tokenContract.address, allPools)
            const resolvedTokenPools = await getTokenVolumeAndGas([tokenPools]);
            console.log(resolvedTokenPools)
            setLoading(false)
            setPools(resolvedTokenPools[0])
        } catch (e) {
            console.log(e)
            setLoading(false)
            setError(true)
        }
    }
    return <Box border='1px' borderRadius="12px" borderColor={"white"} p={4}>
        <Flex justify="between" alignItems="center">
            <Input placeholder="enter contract address" onChange={e => {
                setInput(e.target.value)
                setError(false)
            }}
                   background={"#F5F5F5"}/>
            <Box width={12}/>
            <Button background="green.300" onClick={fetchTokenFromUniswap}>Search</Button>
        </Flex>
        {error && <Box mt={4}><ErrorState/></Box>}
        {loading && !error && <Box mt={4}><LoadingState name={name}/></Box>}
        {!loading && !error && pools.length > 0 &&
        <Box mt={4}>
            < Heading fontSize={"xl"}> {name}</Heading>
            <TokenDetails pools={pools}/>
        </Box>
        }
    </Box>
}


const LoadingState = ({name}) => {
    return <p>Loading...{name}</p>
}

const ErrorState = () => {
    return <p>Contract not found</p>
}


