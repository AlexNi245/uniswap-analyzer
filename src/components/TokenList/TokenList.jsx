import {
    Box,
    Flex,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Table,
    Tbody,
    Th,
    Thead,
    Tr,
    useDisclosure
} from "@chakra-ui/react";
import tokenList from "../trustwalletTokens.json";
import {SELECTED_TOKENS} from "../../constants";
import {useState} from "react";
import {TokenDetails} from "../TokenDetails/TokenDetails";
import {TokenRow} from "./TokenRow";


export const TokenList = ({tokens}) => {
    const {isOpen, onOpen, onClose} = useDisclosure()
    const [selectedTokenInModal, setSelectedTokenInModal] = useState(0)

    const handleOnClickTokenDetails = (idx) => {
        setSelectedTokenInModal(idx)
        onOpen()
    }
    const getTokenName = (tokenContract) => tokenList.tokens.find(t => t.address.toLowerCase() === tokenContract.toLowerCase()).name
    const getTokenImgSrc = (tokenContract) => tokenList.tokens.find(t => t.address.toLowerCase() === tokenContract.toLowerCase()).logoURI

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
                <ModalContent maxW="60vw">
                    <ModalHeader>
                        <Flex alignItems="center">
                            <Box width="5" mr="2">
                                <Image src={getTokenImgSrc(SELECTED_TOKENS[selectedTokenInModal])}/>
                            </Box>
                            {
                                getTokenName(SELECTED_TOKENS[selectedTokenInModal])
                            }

                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody overflowY="scroll">
                        <TokenDetails pools={tokens[selectedTokenInModal]}
                                      tokenContract={SELECTED_TOKENS[selectedTokenInModal]}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    )
}


