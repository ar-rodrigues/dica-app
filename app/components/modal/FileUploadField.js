import { useCallback, useState, forwardRef, useEffect } from "react";
import {
    Input, Box, Text, List, ListItem,
    ListIcon, FormLabel, FormControl,
    InputGroup, InputLeftElement, Button,
    useDisclosure, Modal, ModalOverlay,
    ModalContent, ModalCloseButton, Flex,
    ModalHeader,
    Spinner
} from "@chakra-ui/react";
import { FaCheckCircle, FaUpload, FaTimes, FaFile, FaTrash } from "react-icons/fa";
import { convertFileToBase64 } from "@/utils/convertFiles/convertFile";
import { fetchFiles } from "@/api/documents/storage/storage";

const FileUploadField = forwardRef(({ register, name, rowData, isEditing = false }, ref) => {
    const [files, setFiles] = useState(rowData?.value || []);
    const fileViewModal = useDisclosure()
    const [ selectedFileUrl, setSelectedFileUrl ] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        setFiles(rowData?.value || [])
    }, [rowData?.value])

    const handleFileChange = useCallback(async () => {
        const selectedFiles = Array.from(ref.current.files);
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, ...selectedFiles];
            rowData?.editorCallback(updatedFiles);
            register(name).onChange({ target: { name, value: updatedFiles } });
            return updatedFiles;
        });
    }, [register, name, rowData]);

    const handleRemoveFile = (fileToDelete) => {
        if(fileToDelete.name) {
            const updatedFiles = files.filter(file=> file.fileName !== fileToDelete.name);
            URL.revokeObjectURL(selectedFileUrl.url)
            setSelectedFileUrl(null)
            setFiles(updatedFiles);
            rowData?.editorCallback(updatedFiles)
            register(name).onChange({ target: { name, value: updatedFiles } });
            fileViewModal.onClose();
        } else{
            console.error("File was not deleted")
        }
    };

    const handleOpenModal = async (file)=> {
        fileViewModal.onOpen(); 
        setIsLoading(true)
        if(file.path){
            const storedFileUrl = await fetchFiles(file.path)
            setSelectedFileUrl({url: storedFileUrl.url, name:file.fileName})
            setIsLoading(false)
        } else{
            const objectUrl = URL.createObjectURL(file)
            setSelectedFileUrl({url: objectUrl, name:file.name})
            setIsLoading(false)
        }
    }

    const handleCloseModal = ()=> {
        fileViewModal.onClose();
        URL.revokeObjectURL(selectedFileUrl.url)
        setSelectedFileUrl(null)
    }

    return (
        <Box>
            <FormControl display={"flex"} justifyContent={"center"} alignItems={"center"} p={isEditing ? 2 : 4} m={0} _hover={ { backgroundColor: "gray.100" } } rounded={"md"} shadow={isEditing ? "none" : "md"} >
                <FormLabel w={"full"} h={"full"} pl={4} pt={3} htmlFor={name} fontSize={isEditing ? "xs" : "md"} fontWeight={"bold"} cursor={"pointer"} _hover={ { color: "blue.500" } }>Subir archivos:</FormLabel>
                <InputGroup size={"20px"} display={"flex"} flexDir={"column"} justifyContent={"center"} alignItems={"center"}  >
                    <FaUpload />
                </InputGroup>
                <Input
                    type="file"
                    name={name}
                    ref={ref}
                    onChange={handleFileChange}
                    multiple
                    width='full'
                    variant='filled'
                    opacity={0}
                    overflow={"hidden"}
                    position={"absolute"}
                    left={0}
                    placeholder="Selecciona archivo"
                    size='20px'
                    cursor={"pointer"} 
                />
            </FormControl>
            {files.length > 0 && (
                <Box mt={2}>
                    { !isEditing && <Text fontWeight="bold">Archivos seleccionados:</Text> }
                    <List mt={1} spacing={2}>
                        {files.map((file, index) => {
                            const fileModal = (
                                <Modal isOpen={fileViewModal.isOpen} onClose={ handleCloseModal } size={"md"} >
                                    <ModalOverlay />
                                    <ModalContent p={3} >
                                        <ModalHeader size={"xs"} display={"flex"} justifyContent={"space-between"} alignItems={"center"} width={"100%"} gap={2} >
                                            <Text fontSize={"xs"} overflow={"hidden"} textOverflow={"ellipsis"}>{selectedFileUrl?.name}</Text>
                                            <Button leftIcon={<FaTrash />} minW={"100px"} onClick={() => handleRemoveFile(selectedFileUrl)} size="sm" colorScheme="red" mx={4} >
                                                Eliminar
                                            </Button>
                                            <ModalCloseButton />
                                        </ModalHeader>
                                        <iframe src={selectedFileUrl?.url} width="100%" height="500px" />
                                    </ModalContent>
                                </Modal>
                            )

                            return (
                                <Flex key={index} justifyContent={"space-between"} alignItems={"center"} width={"100%"} >
                                    <ListItem width={"100%"} px={2} >
                                        <Button p={2} leftIcon={<FaFile />}  maxW={"200px"} onClick={()=>handleOpenModal(file)} size={"10px"} variant='outline' colorScheme="blue" mr={4} width={"100%"} >
                                            <Text fontSize={"xs"} overflow={"hidden"} textOverflow={"ellipsis"}>{file.name || file.path.split("/")[2] }</Text>
                                        </Button>
                                        { isLoading && <Spinner /> }
                                        { !isLoading && fileModal}
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
