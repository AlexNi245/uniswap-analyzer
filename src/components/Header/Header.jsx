import React, {useContext} from "react";
import {EthPriceContext} from "../../context/EthPriceContext";
import {Flex, Text} from "@chakra-ui/react";
import {usdFormatter} from "../../functions/CoinGeckoFunctions";

export const Header = () => {

    const etherPrice = useContext(EthPriceContext)
    return <Flex justify="end" pr={16} pt={4}>
        <Text fontWeight={"bold"}>Eth price {usdFormatter.format(etherPrice)}</Text>
    </Flex>
}
