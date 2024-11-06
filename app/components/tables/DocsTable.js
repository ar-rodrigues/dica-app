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


const DocsTable = ({ columns, data, title, hideColumn, isDeleting, setIsDeleting, isDate, editFunction, deleteFunction, useFormHook, webcamRef, fileInputRef, isSubmitted, setIsSubmitted, onCreateDocument, isLoadingFile, setIsLoadingFile, onDocumentEdit,onRowEditComplete }, ref) => {   
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ...columns?.reduce((acc, column) => (
            { ...acc, [column.field]: { value: null, matchMode: FilterMatchMode.CONTAINS } }
        ), {})
    })
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ deletingId, setDeletingId ] = useState(null)
    const { register } = useFormHook()

    
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
                        const file = await fetchFiles(item)
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
        !isDeleting && setDeletingId(null)
    })

    



  return (
      <Box w="100%" h="100%" p={4} >
          <Grid gridRow={2} gridColumn={2} gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} m={10} >
          
              <Flex flexDir={'column'} align="flex-start" justify="space-between" mb={4} >
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    {title}
                </Text>
              </Flex>

              <Button onClick={onOpen}>Nuevo Documento</Button>
              <FormModal 
                    isOpen={isOpen} 
                    onClose={onClose} 
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

          <Box w={"100%"} overflowX="auto" minW={"fit-content"} >
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
                                            <Box w={"100%"} p={4} overflow={"auto"} className="card p-fluid"  >
                                                {
                                                    documents.length > 0 && (
                                                        <DataTable
                                                            value={documents}
                                                            tableStyle={{ minWidth: '700px', fontSize: "0.2rem" }}
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
                                                                                   style={
                                                                                    { fontSize: "0.6rem" }
                                                                                   }
                                                                                   body={ (rowData) => fileBodyTemplate(rowData, field) }
                                                                                   editor={(rowData)=>onDocumentEdit(rowData)}
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
                                                                                    minWidth: '100px'
                                                                                }}
                                                                            />
                                                                            )
                                                                        )
                                                                    })
                                                                }
                                                                { editFunction && 
                                                                    <Column 
                                                                        header="Editar" 
                                                                        style={
                                                                            { fontSize: "0.6rem" }
                                                                           }
                                                                        frozen 
                                                                        alignFrozen="right"
                                                                        rowEditor
                                                                    />
                                                                    }
                                                                { deleteFunction && 
                                                                    <Column 
                                                                    header="Eliminar"
                                                                    style={
                                                                        { fontSize: "0.6rem" }
                                                                       } 
                                                                    frozen
                                                                    alignFrozen="right"
                                                                    body={ (rowData) => (
                                                                            <Button onClick={()=>{
                                                                                deleteFunction(rowData.id,[...rowData.documento, ...rowData.foto])
                                                                                setDeletingId(rowData.id)
                                                                                setIsDeleting(true)
                                                                            }} >
                                                                                { isDeleting && rowData.id === deletingId ? <Spinner/> : <MdDelete />}
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
