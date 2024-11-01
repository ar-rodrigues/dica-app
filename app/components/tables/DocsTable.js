import { fetchFiles } from '@/api/documents/storage/storage'
import storeFiles from "@/utils/storage/storeFiles"
import { createDocument } from "@/api/documents/documents"
import { useEffect, useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Box, Text, Flex, Grid, Button, useDisclosure, Tag, Spinner  } from '@chakra-ui/react';
import { MdDelete, MdInsertPhoto } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa";
import { InputText } from 'primereact/inputtext';
import FormModal from '@/components/modal/FormModal'
import { InputTextarea } from 'primereact/inputtextarea';


import FileUploadField from "@/components/modal/FileUploadField";
import CameraCapture from "@/components/modal/CameraCapture";

const DocsTable = ({ columns, data, setData, title, hideColumn, isDeleting, setIsDeleting, isDate, editFunction, deleteFunction, useFormHook, webcamRef, isSubmitted, setIsSubmitted }) => {   
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ...columns?.reduce((acc, column) => (
            { ...acc, [column.field]: { value: null, matchMode: FilterMatchMode.CONTAINS } }
        ), {})
    })
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ deletingId, setDeletingId ] = useState(null)
    const [ isLoadingFile, setIsLoadingFile ] = useState({fileId:"", loading:false})
    const { register } = useFormHook()

    
    const dateBodyTemplate = (rowData) => {
        const dateField = isDate.find(field => rowData[field]);
        const formatedDate = moment(rowData[dateField]).format('DD/MM/YY HH:mm')
        return dateField ? <Tag>{formatedDate}</Tag> : null; 
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

    const handleEdit = (rowData) => {
        const enabledFields = ["comentarios", "nombre", "documento", "foto"]
        const isColumn = (field) => rowData.field.includes(field)
        
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
                   {...register(rowData.field)} 
                   register={register} 
                   name={rowData.field}
                   className="w-[200px] p-5 p-inputtext-lg"  
                /> :
            isColumn("foto") ?
                <CameraCapture 
                    {...register(rowData.field)} 
                    ref={webcamRef} 
                    register={register} 
                    name={rowData.field} 
                    isSubmitted={isSubmitted} 
                    isModal={true}
                /> :
                <InputText 
                    disabled={!enabledFields.includes(rowData.field)} 
                    variant={!enabledFields.includes(rowData.field) ? "outlined" : "filled"}
                    className="py-5 pl-2 p-inputtext-lg" 
                    value={rowData.value || ""} 
                    onChange={ (e)=> rowData.editorCallback(e.target.value) }
                />
        )
    }

    
    useEffect(() => {
        !isDeleting && setDeletingId(null)
    })

    



  return (
      <Box w="100%" h="100%" p={4}   >
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
                    onSubmit={setData}
                    hideField={["id","created_at","last_change","setup_id","status"]}
                    isComment={["comentarios"]}
                    isLoading={isLoadingFile}
                    setIsLoading={setIsLoadingFile}
                    storeFiles={storeFiles}
                    createDocument={createDocument}
                    useFormHook={useFormHook}
                    webcamRef={webcamRef}
                    isSubmitted={isSubmitted}
                    setIsSubmitted={setIsSubmitted}
                />

          </Grid>

          <Flex flexDir={"column"} >
           {
            data?.map(({ unidad, anexos})=>{
                return (
                    <Flex flexDir={"column"} key={unidad} bg={"gray.100"} pb={6} m={4} >
                        <Text fontSize="xl" fontWeight="bold" bg={"gray.300"} p={4} >{unidad}</Text>
                        <Box   >
                            {
                                anexos?.map(({anexo, documents})=>{
                                    return (
                                        <Flex flexDir={"column"} key={anexo} >
                                            <Text fontSize="lg" fontWeight="bold" mb={4} bg={"gray.200"} pl={4} py={4} >{anexo}</Text>
                                            <Box p={4}   >
                                                {
                                                    documents.length > 0 && (
                                                        <DataTable
                                                            value={documents}
                                                            tableStyle={{ minWidth: '50rem' }}
                                                            loading={!documents && documents.length > 0}
                                                            paginator
                                                            rows={10}
                                                            emptyMessage="Ningún dato encontrado."
                                                            scrollable
                                                            removableSort
                                                            editMode='row'
                                                            onRowEditComplete={(rowData)=>(console.log("onRowEditComplete:",rowData))}
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
                                                                                    { fontSize: "0.875rem" }
                                                                                   }
                                                                                   body={ (rowData) => fileBodyTemplate(rowData, field) }
                                                                                   editor={(rowData)=>handleEdit(rowData)}
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
                                                                                editor={(rowData)=>handleEdit(rowData)}
                                                                                style={{ 
                                                                                    fontSize: "0.875rem",
                                                                                    minWidth: '200px'
                                                                                }}
                                                                            />
                                                                            )
                                                                        )
                                                                    })
                                                                }
                                                                { editFunction && 
                                                                    <Column 
                                                                        header="Editar" 
                                                                        frozen 
                                                                        alignFrozen="right"
                                                                        rowEditor
                                                                    />
                                                                    }
                                                                { deleteFunction && 
                                                                    <Column 
                                                                    header="Eliminar" 
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
                                                    ) || <Text fontSize="lg" fontWeight="bold" mb={4} >No hay documentos</Text>
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

          </Flex>        
          
      </Box>
  );
};

export default DocsTable;
