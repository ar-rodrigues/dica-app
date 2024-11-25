import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Button,
  Box,
  Input,
  Text,
} from '@chakra-ui/react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { FiUpload, FiDownload } from 'react-icons/fi';
import moment from 'moment';

const defaultAlert = { status: '', message: '' };

export default function ImportSheetsButton({ uploadFunction }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState();
  const [alert, setAlert] = useState(defaultAlert);
  const [loading, setLoading] = useState(false);

  const handleModalClose = () => {
    setFile();
    setLoading(false);
    onClose();
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) {
      console.log('No file selected');
      setAlert({ status: 'error', message: 'Ningun archivo seleccionado' });
      return;
    }

    const newFile = acceptedFiles[0];

    Papa.parse(newFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFile({ data: results.data, headers: results.meta.fields });
        setAlert({ status: 'success', message: 'Archivo cargado con exito!' });
      },
      error: (error) => {
        console.log('Error parsing file:', error);
        setAlert({ status: 'Error', message: 'Error al cargar los archivos' });
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async () => {
    if (!file)
      return setAlert({
        status: 'error',
        message: 'Cargue un archivo primero',
      });
    try {
      setLoading(true);
      const uploadFile = await uploadFunction(file.data);
      console.log(uploadFile);
      if (uploadFile.error) {
        setLoading(false);
        setFile();
        return setAlert({
          status: 'error',
          message: uploadFile.error,
        });
      } else {
        setAlert({ status: 'success', message: 'Archivo Cargado con exito' });
        const closeModalTimer = setTimeout(() => {
          setFile();
          setLoading(false);
          handleModalClose();
        }, 2000);
        return () => clearTimeout(closeModalTimer);
      }
    } catch (error) {}
  };

  useEffect(() => {
    const alertTimer = setTimeout(() => {
      setAlert(defaultAlert);
    }, 2000);

    return () => clearTimeout(alertTimer);
  }, [alert]);

  const Dropzone = (
    <Flex
      {...getRootProps()}
      border="2px dashed"
      borderColor="gray.300"
      p={4}
      m={4}
      textAlign="center"
      cursor="pointer"
      _hover={{ borderColor: 'blue.500' }}
      alignItems={'center'}
      justifyContent={'center'}
      flexDir={'column'}
      w={'full'}
    >
      <Input type="file" name="file" id="file" {...getInputProps()} />
      {isDragActive ? (
        <Text>
          Arrastre y suelte un archivo aquí, o haga clic para seleccionarlo
        </Text>
      ) : (
        <FiUpload />
      )}
    </Flex>
  );

  const PreviewTable = (
    <Box>
      {file && (
        <TableContainer maxH={'40vh'} overflow={'auto'} overflowY={'auto'}>
          <Table size={'sm'} variant={'simple'}>
            <TableCaption>Previa de archivos a serem cargados</TableCaption>
            <Thead>
              <Tr>
                {file?.headers.map((header) => (
                  <Th>{header}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {file.data.map((row) => {
                const rowData = Object.entries(row);
                return (
                  <Tr>
                    {rowData.map((rowEntry) => (
                      <Td>{rowEntry[1]}</Td>
                    ))}
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Flex>
      <Button onClick={onOpen}>Importar</Button>
      <Modal
        size={'xl'}
        isCentered
        isOpen={isOpen}
        onClose={() => handleModalClose()}
      >
        <ModalOverlay />
        <ModalContent w={'full'} m={2} pt={2} pb={4}>
          <ModalHeader>Importar Archivo</ModalHeader>
          {alert.status && (
            <Alert status={alert.status}>
              <AlertIcon />
              {alert.message}
            </Alert>
          )}
          <ModalCloseButton />
          <ModalBody>{PreviewTable}</ModalBody>
          <ModalFooter>
            {!file && Dropzone}
            {file && (
              <Flex
                px={'2rem'}
                w={'full'}
                justifyContent={'flex-end'}
                gap={'1rem'}
              >
                <Button
                  disabled={loading ? true : false}
                  colorScheme="blue"
                  variant={'outline'}
                  onClick={() => setFile()}
                >
                  Resetar
                </Button>
                <Button
                  disabled={loading ? true : false}
                  colorScheme="teal"
                  onClick={() => handleSubmit()}
                >
                  Enviar
                </Button>
              </Flex>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
