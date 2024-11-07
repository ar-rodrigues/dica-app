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
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import FileUploadField from "@/components/modal/FileUploadField";
import CameraCapture from "@/components/modal/CameraCapture";


export default function Auditor() {
  const { userRole } = useContext(UserRoleContext);
  const { fullName, role, email, isAdmin } = userRole || {}
  const [ documents, setDocuments ] = useState([])
  const [ setups, setSetups ] = useState([])
  const [ isDeleting, setIsDeleting ] = useState(false)
  const [ columns, setColumns ] = useState([])
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState({ fileId: "", loading: false });


  const {
    register,
    formState: { errors },
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
      setIsSubmitted(true);
      const storeNewFiles = await storeFiles(data);
      if (storeNewFiles) {
        const storedFilePaths = storeNewFiles.filePaths;
        console.log("Creating document")
        const newDocument = await createDocument({
          ...data,
          documento: storedFilePaths.documentoPath,
          foto: storedFilePaths.fotoPath
        });
        if (newDocument) {
          setDocuments(prev => [...prev, newDocument]);
        } else {
          console.log("Error creating document")
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

  // Handle document edits
  const handleDocumentEdit = (rowData) => {
    const enabledFields = ["comentarios", "nombre", "documento", "foto"]
    const isColumn = (field) => rowData.field.includes(field)
  
    const listOfDocs = rowData.field.includes("documento") ? rowData.value : []
    return (
        isColumn("comentarios") ?
            <InputTextarea
                value={rowData.value || ""}
                variant='filled'
                onChange={(e) => rowData.editorCallback(e.target.value)}
                className="p-2 pt-5"
            /> :
        isColumn("documento") ?
            <FileUploadField
                {...register(`${rowData.field}`)}
                register={register }
                ref={fileInputRef}
                label="documentos"
                name={rowData.field}
                rowData={rowData}
                isEditing={true}
                className="w-[200px] p-5 p-inputtext-lg"
            /> :
        isColumn("foto") ?
            <CameraCapture
                {...register(rowData.field)}
                ref={webcamRef}
                register={register}
                name={rowData.field}
                rowData={rowData}
                isEditing={true}
            /> :
            <InputText
                disabled={!enabledFields.includes(rowData.field)}
                variant={!enabledFields.includes(rowData.field) ? "outlined" : "filled"}
                className="py-5 pl-2 p-inputtext-lg"
                value={rowData.value || ""}
                onChange={ ((e)=> rowData.editorCallback(e.target.value)) }
            />
    )
  }

  const handleRowEditComplete = async (rowData) => {
    
    try {
      console.log("updating document")
      const newDocs = rowData.newData.documento
      const newFotos = rowData.newData.foto
      const docId = rowData.newData.id
      const updatedDocument = { ...rowData.newData, last_change: new Date(), documento: newDocs, foto: newFotos };
      setIsLoadingFile({ fileId: docId, loading: true });
      setIsSubmitted(true);
      const storeFilesUpdate = await storeFiles(updatedDocument)
      if(storeFilesUpdate){
        const storedUpdatePaths = storeFilesUpdate.filePaths
        console.log("updated paths", storedUpdatePaths)
        const newUpdateDocument = await updateDocument(docId, { 
            ...updatedDocument, 
            documento: storedUpdatePaths.documentoPath, 
            foto: storedUpdatePaths.fotoPath 
          })
          if(newUpdateDocument){
            setDocuments(prev => [...prev, newUpdateDocument])
          } else {
            throw new Error("Error updating document")
          }
      } else {
        console.error("Error storing file updates:")
        return setIsLoadingFile({fileId: "", loading: false})
      }
    } catch (error) {
      console.error("Error updating document:", error)
    } finally {
      setIsLoadingFile({fileId: "", loading: false})
      setIsSubmitted(false)
    }
  }


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


  if (!userRole || !documents) {
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
        <Flex w="100%" overflowX="auto" mb={8} flexDir={"column"} alignItems={"center"} >
          { isSubmitted && <Spinner size={"md"} />}
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
              fileInputRef={fileInputRef}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
              isLoadingFile={isLoadingFile}
              setIsLoadingFile={setIsLoadingFile}
              onCreateDocument={handleCreateDocument}
              onDocumentEdit={handleDocumentEdit}
              onRowEditComplete={handleRowEditComplete}       
            />
        </Flex>
      </Flex>
    </Box>
  );
}
