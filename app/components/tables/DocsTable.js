import { fetchFiles } from '@/api/documents/storage/storage'
import { useEffect, useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { Box, Text, Flex, Grid, Button, useDisclosure, Tag, Spinner  } from '@chakra-ui/react';
import { MdDelete, MdInsertPhoto } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import FormModal from '@/components/modal/FormModal'


const DocsTable = ({ columns, data, title, hideColumn, isDeletingDocument, setIsDeletingDocument, isDate, editFunction, deleteFunction, useFormHook, webcamRef, cameraModal, fileInputRef, isSubmitted, setIsSubmitted, onCreateDocument, isLoadingFile, setIsLoadingFile, onDocumentEdit,onRowEditComplete }, ref) => {   
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ...columns?.reduce((acc, column) => (
            { ...acc, [column.field]: { value: null, matchMode: FilterMatchMode.CONTAINS } }
        ), {})
    })
    const formModal = useDisclosure();
    const [ deletingDocumentId, setDeletingDocumentId ] = useState(null)
    
    const dateBodyTemplate = (rowData) => {
        const dateField = isDate.find(field => rowData[field]);
        const formatedDate = moment(rowData[dateField]).format('DD/MM/YY HH:mm')
        return dateField ? <Tag fontSize={"0.5rem"}>{formatedDate}</Tag> : null; 
      };

    const fileBodyTemplate = (rowData, field) => {
        if (!rowData[field]) {
          return null;
        }
        return (
            <Flex flexDir={"column"} >
                {
                    rowData[field].map((item) => {
                      const fieldName = field === 'foto' ? <MdInsertPhoto /> : <FaFilePdf />;
                      const handleClick = async ()=>{
                        setIsLoadingFile({fileId:item, loading:true})
                        const file = await fetchFiles(item.path)
                        return file.url
                      }
                      return (
                        <Button 
                            key={item} 
                            onClick={ async (e) => {
                                e.preventDefault()
                                const url = await handleClick()
                                window.open(url, '_blank')
                                setIsLoadingFile({fileId:"", loading:false})
                            }}
                            size='xs'
                            variant='ghost' 
                            >
                                {
                                    isLoadingFile.loading && isLoadingFile.fileId === item ?
                                    <Spinner size='xs' /> :
                                    fieldName
                                }
                        </Button>
                        )
                    })
                }
            </Flex>
        )
      };

    

    
    useEffect(() => {
        !isDeletingDocument && setDeletingDocumentId(null)
    })

    



  return (
      <Box w="100%" h="100%" p={4} mt={10} >
          <Grid p={4} gap={4} > 
          
              <Box w="100%" mb={4} >
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    {title || "Documentos"}
                </Text>
              </Box>
              <Box className="w-full sm:w-[30%] mb-2" >
                <Button className="w-full px-4 py-2 text-sm text-white" colorScheme='blue' onClick={formModal.onOpen}>Nuevo Documento</Button>
              </Box>
              <FormModal 
                    formModal={formModal}
                    cameraModal={cameraModal}
                    title={"Nuevo Documento"} 
                    fields={columns}
                    setupOptions={data}
                    hideField={["id","created_at","last_change","setup_id","status"]}
                    isComment={["comentarios"]}
                    isLoading={isLoadingFile}
                    setIsLoading={setIsLoadingFile}
                    onSubmit={onCreateDocument}
                    useFormHook={useFormHook}
                    webcamRef={webcamRef}
                    fileInputRef={fileInputRef}
                    isSubmitted={isSubmitted}
                    setIsSubmitted={setIsSubmitted}
                />

          </Grid>

          <Box w={"100%"} overflowX="auto" minW={"360px"} >
           {
            data?.map(({ unidad, anexos})=>{
                return (
                    <Flex flexDir={"column"} key={unidad} bg={"gray.100"} pb={6} m={4} >
                        <Text fontSize="sm" fontWeight="bold" bg={"gray.300"} p={4} >{unidad}</Text>
                        <Box w={"100%"} overflow={"auto"}>
                            {
                                anexos?.map(({anexo, documents})=>{
                                    return (
                                        <Flex flexDir={"column"} key={anexo} >
                                            <Text fontSize="sm" fontWeight="bold" mb={4} bg={"gray.200"} pl={4} py={4} >{anexo}</Text>
                                            <Box w={"100%"} p={4} overflow={"auto"} >
                                                {
                                                    documents.length > 0 && (
                                                        <DataTable
                                                            value={documents}
                                                            size='small'
                                                            tableStyle={{
                                                                minWidth: "600px",
                                                                fontSize: "0.6rem", 
                                                            }}
                                                            responsive
                                                            responsiveOptions={{ scrollable: true }}
                                                            loading={!documents && documents.length > 0}
                                                            paginator
                                                            rows={10}
                                                            emptyMessage="Ningún dato encontrado."
                                                            scrollable
                                                            removableSort
                                                            editMode='row'
                                                            onRowEditComplete={onRowEditComplete}
                                                            >
                                                                {
                                                                    columns?.map(({field, header}, index) =>{
                                                                        return (
                                                                            !hideColumn?.includes(field) &&
                                                                            (field === "documento" || field === "foto") ? (
                                                                                <Column 
                                                                                   key={index}
                                                                                   field={field}
                                                                                   header={header}
                                                                                   style={{ 
                                                                                    fontSize: "0.6rem",
                                                                                    minWidth: '50px',
                                                                                    width: "20%"
                                                                                }}
                                                                                   body={ (rowData) => fileBodyTemplate(rowData, field) }
                                                                                   editor={(rowData)=> onDocumentEdit(rowData)}
                                                                                />
                                                                            ) : !hideColumn?.includes(field) && (
                                                                            <Column 
                                                                                key={index} 
                                                                                field={field} 
                                                                                header={header} 
                                                                                sortable
                                                                                showFilterMatchModes={false}
                                                                                filterPlaceholder={`Buscar por ${header.toLowerCase()}...`} 
                                                                                body={isDate?.includes(field) ? dateBodyTemplate : undefined}
                                                                                editor={(rowData)=>onDocumentEdit(rowData)}
                                                                                style={{ 
                                                                                    fontSize: "0.6rem",
                                                                                    minWidth: '50px',
                                                                                    width: "20%"
                                                                                }}
                                                                            />
                                                                            )
                                                                        )
                                                                    })
                                                                }
                                                                { editFunction && 
                                                                    <Column 
                                                                        header="Editar" 
                                                                        style={{ 
                                                                            fontSize: "0.6rem",
                                                                            minWidth: "50px", 
                                                                            maxWidth: "60px",
                                                                            width: "20%"
                                                                        }}
                                                                        frozen
                                                                        alignFrozen="right"
                                                                        rowEditor
                                                                    />
                                                                    }
                                                                { deleteFunction && 
                                                                    <Column 
                                                                    header="Eliminar"
                                                                    style={{ 
                                                                        fontSize: "0.6rem",
                                                                        minWidth: "50px",
                                                                        maxWidth: "60px",
                                                                        width: "20%"
                                                                    }} 
                                                                    frozen
                                                                    alignFrozen="right"
                                                                    body={ (rowData) => (
                                                                            <Button 
                                                                                onClick={()=>{
                                                                                    deleteFunction(rowData.id,[...rowData.documento, ...rowData.foto])
                                                                                    setDeletingDocumentId(rowData.id)
                                                                                    setIsDeletingDocument(true)
                                                                                }}
                                                                                p={2}
                                                                                mr={4}
                                                                                size={"xs"}
                                                                            >
                                                                                { isDeletingDocument && rowData.id === deletingDocumentId ? <Spinner/> : <MdDelete />}
                                                                            </Button>)} 
                                                                    />
                                                                }
                                                        </DataTable>
                                                    ) || <Text fontSize="sm" mb={4} >No hay documentos</Text>
                                                }
                                            </Box>
                                        </Flex>
                                    )
                                })
                            }
                        </Box>
                    </Flex>
                )
            })
           }

          </Box>        
          
      </Box>
  );
};

export default DocsTable;
