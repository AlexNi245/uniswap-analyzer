import {Skeleton, Table, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";

export const LoadingState = () => {
    return <Table variant='simple'>
        <Thead>
            <Tr>
                <Th>Name</Th>
                <Th textAlign="center">Daily Volume </Th>
                <Th textAlign="end">Gas used Daily</Th>
                <Th textAlign="end">Gas fees Daily</Th>
                <Th textAlign="end"> </Th>
            </Tr>
        </Thead>
        <Tbody>
            <Tr>
                <Td> <Skeleton height='20px'/></Td>
                <Td> <Skeleton height='20px'/></Td>
                <Td> <Skeleton height='20px'/></Td>
                <Td> <Skeleton height='20px'/></Td>
            </Tr> <Tr>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
        </Tr> <Tr>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
        </Tr> <Tr>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
            <Td> <Skeleton height='20px'/></Td>
        </Tr>


        </Tbody>
    </Table>
}
