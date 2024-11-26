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
  Spinner,
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
import * as XLSX from 'xlsx';

const defaultAlert = { status: '', message: '', timer: 2000 };

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

  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    console.log(loading);
    if (acceptedFiles?.length === 0) {
      console.log('No file selected');
      setAlert({ status: 'error', message: 'Ningun archivo seleccionado' });
      setLoading(false);
      return;
    }

    const newFile = acceptedFiles[0];
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      try {
        const content = XLSX.read(e.target.result, {
          type: rABS ? 'binary' : 'array',
        });

        const sheetName = content.SheetNames[0];

        const worksheet = content.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log('data', data);

        const sheetHeaders =
          data?.length > 0 ? data[0].map((head) => head.toLowerCase()) : [];
        const requiredHeaders = [
          'unidad_adm',
          'entrante',
          'saliente',
          'anexos',
          'responsable',
        ];

        let missingCol = [];

        requiredHeaders.map((head) => {
          if (!sheetHeaders.includes(head)) return missingCol.push(head);
        });

        if (missingCol.length > 0) {
          console.error(
            `Columnas requeridas o nombre incorrecto: ${missingCol}`,
          );
          setAlert({
            status: 'error',
            message: `Columnas requeridas o nombre incorrecto: ${missingCol}`,
            timer: 5000,
          });
          setLoading(false);
          return;
        }

        // Transform data array of arrays into array of objects be send to the DB as entries
        const entries = data
          .slice(1)
          .map((row) =>
            Object.fromEntries(data[0].map((key, index) => [key, row[index]])),
          );

        setFile({ data: entries, headers: sheetHeaders });
        setAlert({ status: 'success', message: 'Archivo cargado con exito!' });
        setLoading(false);
        console.log(loading);
      } catch (error) {
        console.log('Error parsing file:', error);
        setAlert({ status: 'Error', message: 'Error al cargar los archivos' });
        setLoading(false);
      }
    };

    reader.onerror = (error) => {
      console.log('Error reading file:', error);
      setAlert({ status: 'Error', message: 'Error al cargar los archivos' });
      setLoading(false);
    };

    // Read the file as binary string to support multiple formats
    if (rABS) await reader.readAsBinaryString(newFile);
    else await reader.readAsArrayBuffer(newFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
  });

  const handleSubmit = async () => {
    if (!file)
      return setAlert({
        status: 'error',
        message: 'Cargue un archivo primero',
      });
    try {
      setLoading(true);
      const uploadFile = await uploadFunction(file.data);
      if (uploadFile.error) {
        console.log(uploadFile.error);
        setLoading(false);
        setFile();
        setAlert({
          status: 'error',
          message: `Error al enviar dato: ${
            uploadFile?.error?.message || 'error'
          }`,
          timer: 5000,
        });
        return;
      } else {
        setAlert({ status: 'success', message: 'Archivo Cargado con exito' });
        const closeModalTimer = setTimeout(() => {
          setFile();
          setLoading(false);
          handleModalClose();
        }, 2000);
        return () => clearTimeout(closeModalTimer);
      }
    } catch (error) {
      console.log(`Error submitting data: ${error || 'error'}`);
      setFile();
      setLoading(false);
      setAlert({
        status: 'error',
        message: `Error al enviar dato: ${
          uploadFile?.error?.message || 'error'
        }`,
        timer: 5000,
      });
      return;
    }
  };

  useEffect(() => {
    const alertTimer = setTimeout(() => {
      setAlert(defaultAlert);
    }, alert.timer || 2000);

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
          <ModalBody>
            {!loading ? (
              PreviewTable
            ) : (
              <Flex flexDir={'column'} justify={'center'} alignItems={'center'}>
                <Spinner size={'xl'} />
              </Flex>
            )}
          </ModalBody>
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
