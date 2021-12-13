import {gql} from "apollo-boost";

export const FETCH_TOKENS = gql(
    `
  query tokens ($skip: Int!){
    tokens(first:10, skip:$skip, where:{},orderBy:txCount,orderDirection:desc){
      name
      tradeVolume
      tradeVolumeUSD
      id
    }
  }
`
)
