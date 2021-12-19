import React, {useEffect, useState} from "react";
import {FETCH_TOKENS} from "../graphql/FETCH_TOKEN";
import {useApolloClient} from "@apollo/react-hooks";
import {getPreselectedTokens} from "../uniswapFunctions";


export const TradeVolume = ({}) => {

    const client = useApolloClient();
    const [tokens, setTokens] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

    const PAGE_SIZE = 10;

    const getTokens = async () => {
        const query = FETCH_TOKENS;


        const pools = getPreselectedTokens()
        getLogoUrl(data.tokens[0].id);
        setTokens(oldState => [...oldState, ...data.tokens])
    }

    const getCurrentPage = () => {
        const start = PAGE_SIZE * currentPage
        const stop = start + PAGE_SIZE;

        return tokens.slice(start, stop);
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
        getPreselectedTokens(0, 2);
    }, [getPreselectedTokens]);


    return (
        <></>
    )
}
