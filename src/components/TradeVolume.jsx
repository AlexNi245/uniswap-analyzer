import React, {useEffect, useState} from "react";
import {Image, Table, TableCaption, Tbody, Td, Tfoot, Th, Thead, Tr} from "@chakra-ui/react";
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
        const lastID = tokens.length === 0 ? undefined : tokens[tokens.length - 1];
        const {data} = await client.query({query, variables: {lastID}})
        getLogoUrl(data.tokens[0].id);
        setTokens(oldState => [...oldState, ...data.tokens])
    }

    const getCurrentPage = () => {
        const start = PAGE_SIZE * currentPage
        const stop = start + PAGE_SIZE;
        console.log(tokens)
        // getLogoUrl(tokens[0].id)
        return tokens.slice(start, stop);
    }

    const getLogoUrl = (id) => {
        const {logoURI} = tokenList.tokens.find(t => t.address.toLowerCase() === id);
        return logoURI;
    }


    useEffect(() => {
        getTokens();
    }, []);


    const TokenRow = ({id, name, tradeVolume}) => <Tr>
        <Td> <Image
            maxW={50}
            maxH={50}
            src={getLogoUrl(id)}
        /></Td>
        <Td>{name}</Td>
        <Td>{tradeVolume}</Td>
    </Tr>

    return (
        <div>
            <Table variant='simple'>
                <TableCaption>Imperial to metric conversion factors</TableCaption>
                <Thead>
                    <Tr>
                        <Th></Th>
                        <Th>Name</Th>
                        <Th isNumeric>Value</Th>
                    </Tr>
                </Thead>
                <Tbody>

                    {getCurrentPage().map(t => <TokenRow key={t.id} {...t}/>)}
                </Tbody>
                <Tfoot>
                    <Tr>
                        <Th>To convert</Th>
                        <Th>into</Th>
                        <Th isNumeric>multiply by</Th>
                    </Tr>
                </Tfoot>
            </Table>
        </div>
    )
}
