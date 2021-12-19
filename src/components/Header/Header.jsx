import React, {useContext} from "react";
import {EthPriceContext} from "../../context/EthPriceContext";
import {Flex, Text} from "@chakra-ui/react";
import {currencyFormatter} from "../../utils/currencyFormatter";

export const Header = () => {

    const etherPrice = useContext(EthPriceContext)
    return <Flex justify="end" pr={16} pt={4}>
        <Text fontWeight={"bold"}>Eth price {currencyFormatter.format(etherPrice)}</Text>
    </Flex>
}
