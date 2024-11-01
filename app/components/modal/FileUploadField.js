import { useCallback, useState, forwardRef  } from "react";
import { 
    Input, Box, Text, List, ListItem, 
    ListIcon, FormLabel, FormControl, 
    InputGroup, InputLeftElement, Button 
    } from "@chakra-ui/react";
import { FaCheckCircle, FaUpload, FaTimes  } from "react-icons/fa";
import { v4 as uuid4 } from "uuid"

const FileUploadField = forwardRef(({ register, name }, ref) => {
    const [files, setFiles] = useState([]);
    const [fileNames, setFileNames] = useState([]);

    const handleFileChange = useCallback((e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setFileNames(selectedFiles.map(file => `${uuid4()}-${file.name}`));
        register(name).onChange({ target: { name, value: selectedFiles } });
      }, [register, name]);

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index))
        setFileNames(fileNames.filter((_, i) => i !== index))
        register(name).onChange({ target: { name, value: files.filter((_, i) => i !== index) } })
    }

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
            {fileNames.length > 0 && (
                <Box mt={2}>
                    <Text fontWeight="bold">Archivos seleccionados:</Text>
                    <List mt={1} spacing={2} >
                        {fileNames.map((fileName, index) => (
                            <ListItem key={index}>
                                <ListIcon as={FaCheckCircle} color='green.500' />
                                {fileName}
                                <Button onClick={() => handleRemoveFile(index)} size="10px" variant='outline' colorScheme="red" ml={4} >
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
