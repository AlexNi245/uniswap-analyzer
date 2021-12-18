import {Flex} from "@chakra-ui/react";

export const PoolList = ({pools}) => {

    return pools.map(p => <PoolRow pool={p}/>)

}

const PoolRow = ({pool}) => {
    const name = `${pool.token0.symbol} / ${pool.token1.symbol}`
    const address = pool.poolInfo.poolAddress;
    return (
        <Flex px="4" justifyContent="space-around">
            <p>{name}</p>
            <p>{address}</p>
            <p>{pool.dailyUSDVolume}</p>
        </Flex>
    )
}
