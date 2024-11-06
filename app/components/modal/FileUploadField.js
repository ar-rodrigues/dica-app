import { useCallback, useState, forwardRef } from "react";

import {
    Input, Box, Text, List, ListItem,
    ListIcon, FormLabel, FormControl,
    InputGroup, InputLeftElement, Button
} from "@chakra-ui/react";
import { FaCheckCircle, FaUpload, FaTimes } from "react-icons/fa";

const FileUploadField = forwardRef(({ register, name, rowData, isEditing = false }, ref) => {
    const [files, setFiles] = useState(rowData?.value || []);

    const handleFileChange = useCallback(() => {
        const selectedFiles = Array.from(ref.current.files);
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles, ...selectedFiles];
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
                    <Text fontWeight="bold">Archivos seleccionados:</Text>
                    <List mt={1} spacing={2}>
                        {files.map((file, index) => (
                            <ListItem key={index}>
                                <ListIcon as={FaCheckCircle} color='green.500' />
                                <Text fontSize={"xs"} noOfLines={[1, 2]}>{file.name || file}</Text>
                                <Button onClick={() => handleRemoveFile(index)} size="10px" variant='outline' colorScheme="red" ml={4}>
                                    <FaTimes />
                                </Button>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Box>
    );
});

export default FileUploadField;
