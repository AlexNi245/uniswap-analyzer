import React from "react"
import {Flex, Heading, Icon, Text} from "@chakra-ui/react";
import {GasChart} from "./GasChart";
import {currencyFormatter} from "../../utils/currencyFormatter";
import {PoolList} from "./PoolList";

export const TokenDetails = ({pools}) => {
    console.log(pools)
    const totaldailyVolume = pools.reduce((agg, current) => agg + current.dailyUSDVolume, 0)
    const transactions = pools.reduce((agg, pool) => {
        return [...agg, ...pool.transactions]
    }, [])
    return <>
        <Flex justifyContent="start">
            <Flex direction="column" alignItems="start" mb="4" mr={12}>
                <Heading fontSize="2xl" pb="0" mb="0">{currencyFormatter.format(totaldailyVolume)}</Heading>
                <Text pt="0" mt="0" fontSize="sm" color="grey" si>Daily Volume</Text>
            </Flex>
            <Flex direction="column" alignItems="start">
                <Heading fontSize="2xl" pb="0" mb="0">{transactions.length}</Heading>
                <Text pt="0" mt="0" fontSize="sm" color="grey" si>Transactions</Text>
            </Flex>
        </Flex>


        <Flex justifyContent="space-between">
            <Heading fontSize="2xl" mt={8} mb={4}>Gas Costs </Heading>
            <Flex alignItems="center" mt="2">
                <Flex alignItems="center" mr="2"> <CircleIcon color="#FFECA9"/><Text fontSize="sm">Gas
                    used</Text></Flex>
                <Flex alignItems="center"> <CircleIcon color="#0C91E8"/><Text fontSize="sm">Effective Gas
                    Price</Text></Flex>
            </Flex>
        </Flex>

        <GasChart pools={pools}/>

        <Heading fontSize="2xl" mt={8} mb={4}>Trading Pools ({pools.length}) </Heading>
        <PoolList pools={pools}/>

    </>
}

const CircleIcon = (props) => (
    <Icon viewBox='0 0 200 200' {...props}>
        <path
            fill='currentColor'
            d='M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
        />
    </Icon>
)

