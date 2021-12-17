import React, {useEffect, useState} from "react";
import {Button, Flex, Image, Table, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import {FETCH_TOKENS} from "../graphql/FETCH_TOKEN";
import {useApolloClient} from "@apollo/react-hooks";
import tokenList from "./tokenList.json";


export const TradeVolume = ({}) => {

    const client = useApolloClient();
    const [tokens, setTokens] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const PAGE_SIZE = 10;

    const getTokens = async () => {
        const query = FETCH_TOKENS;

        const {data} = await client.query({query, variables: {skip: tokens.length}, fetchPolicy: "no-cache"})
        getLogoUrl(data.tokens[0].id);
        setTokens(oldState => [...oldState, ...data.tokens])
    }

    const getCurrentPage = () => {
        const start = PAGE_SIZE * currentPage
        const stop = start + PAGE_SIZE;

        return tokens.slice(start, stop);
    }

    const getLogoUrl = (id) => {
        const token = tokenList.tokens.find(t => t.address.toLowerCase() === id);
        //in case the logo is not part of the trustWallet logo repository
        if (token !== undefined) {
            return token.logoURI;
        }
    }

    const scrollTable = async direction => {
        const newCurrentPage = direction === "right" ? currentPage + 1 : currentPage - 1;
        if (newCurrentPage < 0) {
            return;
        }
        const needToLoadNextPage = tokens.length <= newCurrentPage * PAGE_SIZE;
        if (needToLoadNextPage) {
            await getTokens();
        }
        setCurrentPage(newCurrentPage);
    }

    useEffect(() => {
        getTokens();
    }, [getTokens]);


    const TokenRow = ({id, name, tradeVolume, tradeVolumeUSD}) => <Tr>
        <Td> <Image
            maxW={50}
            maxH={50}
            src={getLogoUrl(id)}
        /></Td>
        <Td fontWeight="bold">{name}</Td>
        <Td textAlign="center">{parseFloat(tradeVolume).toFixed(3)}</Td>
        <Td textAlign="end">{parseFloat(tradeVolumeUSD).toFixed(3)}</Td>
    </Tr>

    return (
        <div>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th></Th>
                        <Th>Name</Th>
                        <Th textAlign="center">24h Volume </Th>
                        <Th textAlign="end">24h Volume in USD</Th>
                    </Tr>
                </Thead>
                <Tbody>

                    {getCurrentPage().map(t => <TokenRow key={t.id} {...t}/>)}
                </Tbody>
            </Table>
            <Flex w="100%" paddingX="6" paddingY="2" justifyContent="space-between">
                <Button onClick={() => scrollTable("left")}>Left</Button>
                <Button onClick={() => scrollTable("right")}>Right</Button>
            </Flex>
        </div>
    )
}
