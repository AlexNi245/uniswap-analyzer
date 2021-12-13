import {gql} from "apollo-boost";

export const FETCH_TOKENS = gql(
    `
  query {
    tokens(first:10,where:{},orderBy:txCount,orderDirection:desc){
      name
      tradeVolume
      id
    }
  }
`
)
