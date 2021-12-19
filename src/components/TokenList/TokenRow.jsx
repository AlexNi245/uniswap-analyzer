import {BigNumber, ethers} from "ethers";
import tokenList from "../trustwalletTokens.json";
import {Button, Image, Td, Tr} from "@chakra-ui/react";
import {currencyFormatter} from "../../utils/currencyFormatter";

export const TokenRow = ({pools, tokenContract, onClick}) => {
    const totaldailyVolume = pools.reduce((agg, current) => agg + current.dailyUSDVolume, 0)

    const totalGasUsed = pools.reduce((agg, pool) => {
            const poolsTotalGasUSed = pool.transactions.reduce((poolsAgg, transaction) => {
                return poolsAgg.add(transaction.gasInfo.gasUsed)
            }, BigNumber.from(0))

            return agg.add(poolsTotalGasUSed)
        }, BigNumber.from(0)
    ).toNumber()

    const totalGasFees = pools.reduce((agg, pool) => {
            const poolsTotalGasUSed = pool.transactions.reduce((poolsAgg, transaction) => {
                let {gasInfo: {gasUsed, effectiveGasPrice}} = transaction;
                gasUsed = BigNumber.from(gasUsed)
                effectiveGasPrice = BigNumber.from(effectiveGasPrice)


                const transActionsGasFee = gasUsed.mul(effectiveGasPrice)
                return poolsAgg.add(transActionsGasFee)
            }, BigNumber.from(0))

            return agg.add(poolsTotalGasUSed)
        }, BigNumber.from(0)
    ).toString()

    const {name, logoURI} = tokenList.tokens.find(t => t.address.toLowerCase() === tokenContract.toLowerCase())

    const etherUsd = 3900; //Toto replace with context


    return (<Tr>
        <Td> <Image
            maxW={50}
            maxH={50}
            src={logoURI}
        /></Td>
        <Td fontWeight="bold">{name}</Td>
        <Td textAlign="center">{currencyFormatter.format(totaldailyVolume)}</Td>
        <Td textAlign="end">{totalGasUsed}</Td>
        <Td textAlign="end">{currencyFormatter.format(ethers.utils.formatEther(totalGasFees) * etherUsd)}</Td>
        <Td textAlign="end"><Button onClick={onClick}>Info</Button></Td>
    </Tr>)
}
