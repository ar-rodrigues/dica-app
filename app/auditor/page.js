'use client'
import { Box, Flex, Heading, Text, Spinner, Button } from '@chakra-ui/react';
import { useContext, useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form'
import { UserRoleContext } from '@/contexts';
import useSupabaseChannel from '@/utils/hooks/useSupabaseChannel';
import useTransformSetups from '@/utils/hooks/useTransformSetups';
import { fetchDocument, createDocument, updateDocument, deleteDocument } from '@/api/documents/documents';
import { fetchSetup } from '@/api/setups/setups';
import DocsTable from '@/components/tables/DocsTable';
import { storeFiles } from "@/utils/storage/storeFiles";


export default function Auditor() {
  const { userRole } = useContext(UserRoleContext);
  const { fullName, role, email, isAdmin } = userRole || {}
  const [ documents, setDocuments ] = useState([])
  const [ setups, setSetups ] = useState([])
  const [ isDeleting, setIsDeleting ] = useState(false)
  const [ columns, setColumns ] = useState([])
  const webcamRef = useRef(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState({ fileId: "", loading: false });


  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { status: "Pendiente" }});


  const channels = [
    { 
      channelName: 'documents-channel', 
      schema: 'public', 
      table: 'documents', 
      event: '*',
      callback: (payload) => {
        const newDocument = payload.new
        const oldDocument = payload.old
        console.log('Change received:', payload)
        if (payload.eventType === 'INSERT') {
          if (!documents.some(document => document.id === newDocument.id)) {
            setDocuments(prevDocuments => [...prevDocuments, newDocument])
          }
        } else if (payload.eventType === 'UPDATE') {
          setDocuments(prevDocuments => prevDocuments.map(document => document.id === newDocument.id ? newDocument : document))
        } else if (payload.eventType === 'DELETE') {
          setDocuments(prevDocuments => prevDocuments.filter(document => document.id !== oldDocument.id))
          setIsDeleting(false)
        }
      }
    },
    {
      channelName: 'setups-channel', 
      schema: 'public', 
      table: 'setups', 
      event: '*',
      callback: (payload) => {
        const newSetup = payload.new
        const oldSetup = payload.old
        console.log('Change received:', payload)
        if (payload.eventType === 'INSERT') {
          if (!setups.some(setup => setup.id === newSetup.id)) {
            setSetups(prevSetups => [...prevSetups, newSetup])
          }
          } else if (payload.eventType === 'UPDATE') {
            setSetups(prevSetups => prevSetups.map(setup => setup.id === newSetup.id ? newSetup : setup))
          } else if (payload.eventType === 'DELETE') {
            setSetups(prevSetups => prevSetups.filter(setup => setup.id !== oldSetup.id))
          }
      }
    }
  ];

  const { isSubscribed } = useSupabaseChannel(channels);

  // Handle new document creation
  const handleCreateDocument = async (data) => {
    console.log("sending files");
    try {
      setIsLoadingFile({ fileId: data.id, loading: true });
      const storeNewFiles = await storeFiles(data);
      if (storeNewFiles) {
        const storedFilePaths = storeNewFiles.filePaths;
        const newDocument = await createDocument({
          ...data,
          documento: storedFilePaths.documentoPath,
          foto: storedFilePaths.fotoPath
        });
        if (newDocument) {
          setIsSubmitted(true);
        } else {
          throw new Error("Error creating document. Document creation aborted.");
        }
      } else {
        console.error("Error storing files. Document creation aborted.");
        
        return setIsLoadingFile({ fileId: "", loading: false });;
      }
    } catch (error) {
      console.error("Error creating document:", error);
    } finally {
      setIsLoadingFile({ fileId: "", loading: false });
      setIsSubmitted(false);
    }
  };


  useEffect(() => {
    const fetchData = async () => {
        try {
            const documentsData = await fetchDocument()
            const setupsData = await fetchSetup()
            let newColumns
            if (documentsData.data) {
                // headers for the columns of the table
                const headers = documentsData.headers
                const nameHeaders = documentsData.nameHeaders
                const headerTypes = documentsData.headerTypes
                newColumns = headers.map((key, index) => ({ field: key, header: nameHeaders[index], type: headerTypes[index] }));
            }
            
            setSetups(setupsData.data);
            setDocuments(documentsData.data)
            setColumns(newColumns);
        } catch (err) {
            console.error('Error fetching Documents:', err)
        }
      }
      fetchData()
  }, [])

  // Define the fields configuration at the component level
  const fieldsToInclude = [
    'entrante',
    'saliente',
    'responsable',
    { name: 'anexo', isArray: true }
  ];

  // Use the transform hook here, at the component level
  const transformedSetups = setups ? useTransformSetups(setups, 'unidad_adm', fieldsToInclude) : [{unidad_admin:"",entrante:"", saliente:"", responsable:"", anexos:[] }];
  const transformedDocuments = transformedSetups?.reduce((acc, setup) => {
    const unidad = setup.unidad_adm || "";
    const entrante = setup.entrante || ""
    const saliente = setup.saliente || ""
    const responsable = setup.responsable || ""
    const anexos = setup.anexos || [];
  
    acc.push({ unidad, entrante, saliente, responsable, anexos: anexos?.map(anexo => {
      const documentsForAnexo = documents?.filter(doc => doc.anexo === anexo && doc.unidad_adm === unidad) || [];
      return { anexo, documents: documentsForAnexo };
    })});
  
    return acc;
  }, []);


  if (!userRole && !documents) {
    return <Flex justify="center" align="center" height="100vh"><Spinner size="xl" /></Flex>
  }
  
  return (
    <Box w={"100%"} h={"100%"} p={4} mt={10} mb={10} >
      <Flex direction="column" align="center">
        <Heading as="h1" size="2xl" mb={4}>
          Hola {userRole? fullName : ""} !
        </Heading>
        <Text fontSize="xl">
          Has accedido con exito.
        </Text>
      </Flex>
      <Flex direction="column" align="center" mt={8}>
        <Heading as="h2" size="xl" mb={4}>Auditor</Heading>
        <Box w="100%" overflowX="auto" mb={8}>
          <DocsTable 
              data={transformedDocuments}
              documents={documents}
              setData={setDocuments}
              editFunction={updateDocument}
              deleteFunction={deleteDocument}
              setupOptions={transformedSetups}
              columns={columns} 
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
              isDate={["created_at","last_change"]}
              hideColumn={["id","created_at","setup_id","unidad_adm","entrante","saliente"]} 
              useFormHook={useForm}     
              webcamRef={webcamRef}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
              isLoadingFile={isLoadingFile}
              setIsLoadingFile={setIsLoadingFile}
              onCreateDocument={handleCreateDocument}       
            />
        </Box>
      </Flex>
    </Box>
  );
}
