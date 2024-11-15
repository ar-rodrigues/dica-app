import { useCallback, useState, forwardRef } from "react";
import {convertFileToBase64} from "@/utils/convertFiles/convertFile"
import {
    Input, Box, Text, List, ListItem,
    ListIcon, FormLabel, FormControl,
    InputGroup, InputLeftElement, Button,
    useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalCloseButton, Flex,
    ModalHeader
} from "@chakra-ui/react";
import { FaCheckCircle, FaUpload, FaTimes, FaFile, FaTrash } from "react-icons/fa";

const FileUploadField = forwardRef(({ register, name, rowData, isEditing = false }, ref) => {
    const [files, setFiles] = useState(rowData?.value || []);
    const fileViewModal = useDisclosure()
    const [ selectedFileUrl, setSelectedFileUrl ] = useState(null)

    const handleFileChange = useCallback(async () => {
        const selectedFiles = Array.from(ref.current.files);
        // Convert files to Base64
        const base64Files = await Promise.all(
            selectedFiles.map(async (file) => ({
                name: file.name,
                file: await convertFileToBase64(file),
            }))
        );
        console.log("SelectedFiles", base64Files)
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, ...base64Files];
            rowData?.editorCallback(updatedFiles);
            register(name).onChange({ target: { name, value: updatedFiles } });
            return updatedFiles;
        });
    }, [register, name, rowData]);

    const handleRemoveFile = (index) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        register(name).onChange({ target: { name, value: updatedFiles } });
    };

    return (
        <Box>
            <FormControl display={"flex"} justifyContent={"center"} alignItems={"center"} p={4} m={4} >
                <FormLabel cursor={"pointer"} htmlFor={name}>Subir archivos:</FormLabel>
                <InputGroup size={"20px"} display={"flex"} flexDir={"column"} justifyContent={"center"} alignItems={"center"} >
                    <InputLeftElement as={FaUpload} />
                </InputGroup>
                <Input
                    type="file"
                    name={name}
                    ref={ref}
                    onChange={handleFileChange}
                    multiple
                    width='auto'
                    variant='filled'
                    opacity={0}
                    overflow={"hidden"}
                    position={"absolute"}
                    placeholder="Selecciona archivo"
                    size='20px'
                />
            </FormControl>
            {files.length > 0 && (
                <Box mt={2}>
                    { !isEditing && <Text fontWeight="bold">Archivos seleccionados:</Text> }
                    <List mt={1} spacing={2}>
                        {files.map((file, index) => {
                            const fileModal = (
                                <Modal isOpen={fileViewModal.isOpen} onClose={ ()=> {fileViewModal.onClose(); setSelectedFileUrl(null)} } size={"md"} >
                                    <ModalOverlay />
                                    <ModalContent p={3} >
                                        <ModalHeader size={"xs"} display={"flex"} justifyContent={"space-between"} alignItems={"center"} width={"100%"} >
                                            <Text fontSize={"xs"} overflow={"hidden"} textOverflow={"ellipsis"}>{file.name || file.path }</Text>
                                            <Button leftIcon={<FaTrash />} minW={"100px"} onClick={() => handleRemoveFile(index)} size="sm" colorScheme="red" ml={4} >
                                                Eliminar
                                            </Button>
                                        </ModalHeader>
                                        <iframe src={selectedFileUrl} width="100%" height="500px" />
                                    </ModalContent>
                                </Modal>
                            )

                            return (
                                <Flex key={index} justifyContent={"space-between"} alignItems={"center"} width={"100%"} >
                                    <ListItem width={"100%"} px={2} >
                                        <Button p={2} leftIcon={<FaFile />}  maxW={"200px"} onClick={ ()=> {fileViewModal.onOpen(); setSelectedFileUrl(file.file || file.dataURL)}} size={"10px"} variant='outline' colorScheme="blue" mr={4} width={"100%"} >
                                            <Text fontSize={"xs"} overflow={"hidden"} textOverflow={"ellipsis"}>{file.name || file.path.split("/")[2] }</Text>
                                        </Button>
                                        {fileModal}
                                    </ListItem>
                                </Flex>
                            )
                        })}
                    </List>
                </Box>
            )}
        </Box>
    );
});

export default FileUploadField;
