import React, {useContext, useEffect, useState} from "react"
import {Box, Flex, Heading, Text} from "@chakra-ui/react";
import {PoolContext} from "../../context/PoolContext";
import {fetchTransactionsFromUniswapPool, getStartBlock, web3Provider} from "../../uniswapFunctions";

export const PoolStats = () => {
    const allPools = useContext(PoolContext)
    const [recentPools, setRecentPools] = useState([])
    const [events, setEvents] = useState({"Mint": 0, "Swap": 0, "Burn": 0, "Collect": 0})

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        initializeSection()
    }, [allPools])


    const initializeSection = async () => {
        const fromBlock = getStartBlock()
        const toBlock = await web3Provider.getBlockNumber() - fromBlock;

        const _recentPools = allPools.filter(p => p.blockNumber > toBlock)
        setRecentPools(_recentPools)

        const poolsWithTransactions = await Promise.all(_recentPools.map(p => fetchTransactionsFromUniswapPool(p)));

        const allTransactions = poolsWithTransactions.reduce((agg, p) => [...agg, ...p.transactions], [])

        const _groupedEvents = allTransactions.reduce((agg, {resolvedEvent}) => {
            const eventName = resolvedEvent.name;
            if (agg[eventName] === undefined) {
                agg[eventName] = 0
            }
            agg[eventName] = agg[eventName] + 1

            return agg;
        }, [])

        setEvents(_groupedEvents)

        if (allPools.length > 0) {
            setLoading(false)
        }

    }


    return loading ? <Flex justify="center"><Text>Pools are being loaded </Text></Flex> : <Box>
        <Flex justify="space-between">
            <Flex>
                <Flex
                    background={"rgb(255,0,122)"}
                    px={4}
                    py={4}
                    border={1}
                    borderRadius={12}
                    mt={6}
                    direction="column"
                    alignItems="center"
                    justify={"space-between"}
                    mb="4"
                    mr={12}
                >
                    <Text pt="0" mt="0" fontSize="lg" fontWeight={"bold"} color={"white"}>Uniswap V3 pools</Text>
                    <Heading fontSize="6xl" pb="0" mb="0" color={"white"}>{allPools.length}</Heading>
                </Flex>
                <Flex
                    background="#0C57E8"
                    px={4}
                    py={4}
                    border={1}
                    borderRadius={12}
                    mt={6}
                    direction="column"
                    alignItems="center"
                    justify={"space-between"}
                    mb="4"
                    mr={12}
                >
                    <Text pt="0" mt="0" fontSize="lg" fontWeight={"bold"} color={"white"}>Pools created today</Text>
                    <Heading fontSize="6xl" pb="0" mb="0" color={"white"}>{recentPools.length}</Heading>
                </Flex>


            </Flex>
            <Flex background={"#E8A717"}
                  px={4}
                  py={4}
                  border={1}
                  borderRadius={12}
                  mt={6}
                  direction="column"
                  alignItems="start"
                  justify={"space-between"}
                  mb="4"

            >
                <Text pt="0" mt="0" fontSize="lg" fontWeight={"bold"} color={"white"}>Events emitted by today's created
                    pools</Text>
                <Flex direction={"row"} mt={2} mb={2} justify={"space-between"} w={"100%"}>
                    <Flex direction={"column"} mr={8}>
                        <Flex alignItems="center" mb={2} width="100px" justify="space-between">
                            <Text pt="0" mt="0" mr="2" fontSize="lg" color="white">Mint</Text>
                            <Heading fontSize="2xl" pb="0" mb="0" color="white"> {events.Mint}</Heading>
                        </Flex>


                        <Flex alignItems="center" width="100px" justify="space-between">
                            <Text pt="0" mt="0" mr="2" fontSize="lg" color="white">Swap</Text>
                            <Heading fontSize="2xl" pb="0" mb="0" color="white">{events.Swap}</Heading>
                        </Flex>

                    </Flex>
                    <Flex direction={"column"}>
                        <Flex alignItems="center" width="100px" mb={2} justify="space-between">
                            <Text pt="0" mt="0" mr="2" fontSize="lg" color="white">Burn</Text>
                            <Heading fontSize="2xl" pb="0" mb="0" color="white">{events.Burn}</Heading>
                        </Flex>


                        <Flex alignItems="center" width="100px" justify="space-between">
                            <Text pt="0" mt="0" mr="2" fontSize="lg" color="white">Collect</Text>
                            <Heading fontSize="2xl" pb="0" mb="0" color="white">{events.Collect}</Heading>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    </Box>
}
