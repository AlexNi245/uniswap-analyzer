export const TokenValue = ({pools}) => {
    const totalValue = pools.reduce((agg, current) => agg + current.dailyUSDVolume, 0)
    return (
        <p>Total Value :{totalValue}</p>
    )
}
