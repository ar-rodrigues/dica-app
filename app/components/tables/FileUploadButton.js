import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { FileUpload } from 'primereact/fileupload';
import { Flex, Box, Button, useToast } from '@chakra-ui/react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import moment from 'moment';


export default function FileUploadButton({ isExport = false, data, setData, tableName, uploadFunction, dataStructure, fileType }) {
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const router = useRouter()
    const fileUploadRef = useRef(null)

    const importCSV = async (event) => {
        const file = event.files[0];
        setIsLoading(true);
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
                //console.log('Results:', results)
              const creationPromises = results.data.map((userRow) => {
                // Extract data from each user row based on dataStructure
                const newData = dataStructure.reduce((acc, col) => {
                  let value = userRow[col.field]?.trim(); // Trim whitespace from the end
                  switch (col.type) {
                    case String:
                      acc[col.field] = value;
                      break;
                    case Number:
                      acc[col.field] = parseInt(value, 10);
                      break;
                    case Date:
                      acc[col.field] = moment(value);
                      break;
                    default:
                      acc[col.field] = value;
                  }
                  return acc;
                }, {});

                // Filter out rows with all empty fields
                if (Object.values(newData).some(value => value !== '' && value !== undefined)) {
                    //console.log("import component results: ", newData);
                    return uploadFunction(newData); 
                  } else {
                    console.warn('Skipping row with all empty fields.');
                    return Promise.resolve(); 
                  }
              });
    
              await Promise.all(creationPromises); 
              toast({
                title: 'Importación exitosa',
                description: 'Los datos se importaron correctamente.',
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
            } catch (error) {
              console.log('Catch Error importing CSV:', error);
              toast({
                title: 'Error en la importación',
                description: 'Hubo un error al importar los datos. Try catch error',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            } finally {
              setIsLoading(false);
              setData([...data, ...results.data])
              //fileUploadRef?.current.clear();
            }
          },
          error: (err) => {
            console.log('Error parsing CSV:', err);
            toast({
              title: 'Error en la importación',
              description: 'Hubo un error al importar los datos.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
            setIsLoading(false);  
          },
        });
      };


    const exportCSV = () => {
        try {
            setIsLoading(true);
            
            // Convert the data to CSV format
            const csv = Papa.unparse(data);
            
            // Add BOM to CSV content to support special characters
            const bom = '\uFEFF'; // UTF-8 BOM
            const csvWithBom = bom + csv;

            // Create a Blob with the CSV data and UTF-8 BOM
            const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
            
            // Create a download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${tableName}.csv`);
            
            // Trigger the download
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast({
                title: 'Exportación exitosa',
                description: 'Los datos se exportaron correctamente.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error exporting CSV:', error);
            toast({
                title: 'Error en la exportación',
                description: 'Hubo un error al exportar los datos.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box p={4} bg="white" boxShadow="sm" borderRadius="md">
            <Flex flexDir="column" gap={5} mb={4}>
                {isExport ? (
                    <Button 
                        className="p-button-outlined"
                        padding={6}
                        backgroundColor={"lightseagreen"}
                        isLoading={isLoading}
                        onClick={exportCSV}
                        leftIcon={<FiDownload />}
                    >
                        Exportar CSV
                    </Button>
                ) : (
                    !isLoading && 
                    <FileUpload 
                        ref={fileUploadRef}
                        mode="basic"
                        accept={fileType}
                        maxFileSize={1000000}
                        chooseLabel="Importar CSV"
                        uploadHandler={importCSV}
                        icon={<FiUpload />}
                        customUpload
                        loading={isLoading?"Importando":undefined}
                    />
                )}
            </Flex>
        </Box>
    );
}