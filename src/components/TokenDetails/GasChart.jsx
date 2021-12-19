import {BigNumber, ethers} from "ethers";
import {web3Provider} from "../../uniswapFunctions";
import {Chart, registerables} from "chart.js";
import {useEffect, useState} from "react";

export const GasChart = ({pools}) => {

    const [chartId, setChartId] = useState("")

    const calcGasUsed = () => {
        const foldedTransactions = pools.reduce((agg, pool) => {
            return [...agg, ...pool.transactions]
        }, [])

        const foo = foldedTransactions.map(t => BigNumber.from(t.gasInfo.gasUsed).toString());
        console.log(foldedTransactions[0])
        return foo;
    }

    const calcEffictiveGasPrice = () => {
        const foldedTransactions = pools.reduce((agg, pool) => {
            return [...agg, ...pool.transactions]
        }, [])

        const foo = foldedTransactions.map(t => ethers.utils.formatUnits(BigNumber.from(t.gasInfo.effectiveGasPrice).toString(), "gwei"));
        console.log(foo)
        return foo;
    }

    const data = {
        datasets: [
            {

                data: calcEffictiveGasPrice(),
                borderColor: "#0057FF",
                backgroundColor: "#0C91E8",
                yAxisID: 'y1',
                fill: true

            },
            {

                data: calcGasUsed(),
                borderColor: "#E6D598",
                backgroundColor: "#FFECA9",
                yAxisID: 'y',
                fill: true,
                showLabel: false
            },

        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',

                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            }
        },
    };

    const calcLabels = async () => {
        //Fold Transaction from each pool
        const foldedTransactions = pools.reduce((agg, pool) => {
            return [...agg, ...pool.transactions]
        }, [])

        const transationsorderedByBlockNumber = foldedTransactions.sort((a, b) => {
            return a.blockNumber > b.blockNumber
        })

        const highestBlockNumber = transationsorderedByBlockNumber[transationsorderedByBlockNumber.length - 1].blockNumber


        const highestBlock = await web3Provider.getBlock(highestBlockNumber)
        const highestBlockDAte = new Date(highestBlock.timestamp * 1000)


        const timeStamps = [];
        for (const i in [...Array(24).keys()]) {
            timeStamps.push((highestBlockDAte.getHours() - i) % 24);
        }

        //Handle negative value
        return timeStamps.reverse().map(d => {
            if (d > 0) {
                return d
            }
            return 24 + d

        })
    }


    useEffect(() => {
        const load = async () => {
            const labels = await calcLabels();
            const chartId = Math.random(0, 100000).toString()
            setChartId(chartId)
            const ctx = document.getElementById(chartId).getContext('2d');
            Chart.register(...registerables);
            new Chart(ctx, {...config, data: {...data, labels},})
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return <div>
        <canvas id={chartId} width="1200" height="200"></canvas>
    </div>
}
