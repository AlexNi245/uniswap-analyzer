import {
    Button,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useDisclosure
} from "@chakra-ui/react";
import tokenList from "./tokenList.json";
import {SELECTED_TOKENS} from "../constants";
import {BigNumber, ethers} from "ethers";
import {useState} from "react";
import {TokenDetails} from "./TokenDetails";


export const TokenValue = ({tokens}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const [selectedTokenInModal, setSelectedTokenInModal] = useState(0)

    const handleOnClickTokenDetails = (idx) => {
        setSelectedTokenInModal(idx)
        onOpen()
    }

    return (
        <div>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th></Th>
                        <Th>Name</Th>
                        <Th textAlign="center">Daily Volume </Th>
                        <Th textAlign="end">Gas used Daily</Th>
                        <Th textAlign="end">Gas fees Daily</Th>
                        <Th textAlign="end"> </Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tokens.map((t, idx) => <TokenRow
                        key={t.id}
                        pools={t}
                        onClick={() => handleOnClickTokenDetails(idx)}
                        tokenContract={SELECTED_TOKENS[idx]}/>)}
                </Tbody>
            </Table>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent width="80%">
                    <ModalHeader>Modal Title</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <TokenDetails token={tokens[selectedTokenInModal]}
                                      tokenContract={SELECTED_TOKENS[selectedTokenInModal]}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

const TokenRow = ({pools, tokenContract, onClick}) => {
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

                // console.log(gasUsed.toNumber())
                //   console.log(effectiveGasPrice.toNumber())

                const transActionsGasFee = gasUsed.mul(effectiveGasPrice)
                return poolsAgg.add(transActionsGasFee)
            }, BigNumber.from(0))

            return agg.add(poolsTotalGasUSed)
        }, BigNumber.from(0)
    ).toString()

    const {name, logoURI} = tokenList.tokens.find(t => t.address.toLowerCase() === tokenContract.toLowerCase())

    const etherUsd = 3900; //Toto replace with context
    const currecnyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (<Tr>
        <Td> <Image
            maxW={50}
            maxH={50}
            src={logoURI}
        /></Td>
        <Td fontWeight="bold">{name}</Td>
        <Td textAlign="center">{currecnyFormatter.format(totaldailyVolume)}</Td>
        <Td textAlign="end">{totalGasUsed}</Td>
        <Td textAlign="end">{currecnyFormatter.format(ethers.utils.formatEther(totalGasFees) * etherUsd)}</Td>
        <Td textAlign="end"><Button onClick={onClick}>Info</Button></Td>
    </Tr>)
}
