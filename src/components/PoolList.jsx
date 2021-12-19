import {Table, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import {currencyFormatter} from "../utils/currencyFormatter";

export const PoolList = ({pools}) => {
    return <Table variant='simple'>
        <Thead>
            <Tr>
                <Th>Name</Th>
                <Th textAlign="left">Daily Volume </Th>
                <Th textAlign="center">Address</Th>
            </Tr>
        </Thead>
        <Tbody>
            {pools.map(p => <PoolRow pool={p}/>)}
        </Tbody>
    </Table>

}

const PoolRow = ({pool}) => {
    const name = `${pool.token0.symbol} / ${pool.token1.symbol}`
    const address = pool.poolInfo.poolAddress;
    return (
        <Tr>
            <Td fontWeight="bold">{name}</Td>
            <Td textAlign="left">{currencyFormatter.format(pool.dailyUSDVolume)}</Td>
            <Td textAlign="center">{address}</Td>
        </Tr>
    )
}
