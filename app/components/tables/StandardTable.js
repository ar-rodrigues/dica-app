import { useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Box, Text, Flex, Grid, Button } from '@chakra-ui/react';
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { parseISO } from 'date-fns';
import { MdDelete, MdModeEdit  } from "react-icons/md";
import GlobalFilterInput from './GlobalFilterInput';
import FileUploadButton from './FileUploadButton';
import { InputText } from 'primereact/inputtext';

const StandardTable = ({ data,setData, columns, title, hideColumn, dropdownColumn, isDate, dataStructure, uploadFunction, editFunction, deleteFunction }) => {
    const [editValue, setEditValue] = useState()    
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        ...columns?.reduce((acc, column) => (
            { ...acc, [column.field]: { value: null, matchMode: FilterMatchMode.CONTAINS } }
        ), {})
    })

    const dateBodyTemplate = (rowData) => {
        const dateField = isDate.find(field => rowData[field]);
        return dateField ? moment(rowData[dateField]).format('DD/MM/YYYY') : null; 
      };


    const dropdownRowFilterTemplate = (options) => {
        const dropdownOptions = dropdownColumn?.find(item => item.field === options.field)?.options || [];
        // Dropdown filter 
        return (
            <Dropdown 
                value={options.value} 
                onChange={(e) => options.filterApplyCallback(e.value)} 
                options={ dropdownOptions}
                placeholder="Selecciona" 
                className="p-column-filter" 
                showClear 
            />
        )

    }

    const handleEdit = (rowData) => {
        const dropdownOptions = dropdownColumn?.find(item => item.field === rowData.field)?.options || []
        const isDateValue = isDate?.includes(rowData.field) ? rowData.value && parseISO(moment(rowData.value).toISOString()) : null
        const isNumber = dataStructure?.find(item => item.field === rowData.field)?.type === "number" || false
        
        return dropdownColumn ?.find(item => item.field === rowData.field) ? 
                    <Dropdown 
                        value={rowData.value || ""}
                        onChange={(e)=> rowData.editorCallback(e.value)}
                        options={ dropdownOptions }
                        className='p-column-filter'
                    /> : 
                    isDateValue ? 
                    <SingleDatepicker 
                        name="date-input"
                        date={isDateValue || null}
                        onDateChange={(e)=>rowData.editorCallback(e)}
                        configs={{
                            dateFormat: 'dd-MM-yyyy',
                            dayNames: [ 'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab' ],
                            monthNames: [ 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ],
                          }}
                    /> :
                    <InputText
                        value={ isNumber ? parseInt(rowData.value) : rowData.value }
                        type={ isNumber ? "number" : "text" }
                        onChange={ (e)=> rowData.editorCallback(e.target.value) }
                    />
    }




  return (
      <Box w="full" p={4}   >
          <Grid gridRow={2} gridColumn={2} gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} m={10} >
          
              <Flex flexDir={'column'} align="flex-start" justify="space-between" mb={4} >
                <Text fontSize="xl" fontWeight="bold" mb={4}>
                    {title}
                </Text>

                <GlobalFilterInput filters={filters} setFilters={setFilters} />
              </Flex>

              <Flex alignItems={"center"} justifyContent={"flex-end"} >
                <FileUploadButton isExport={true} data={data} tableName={title}/>
                <FileUploadButton
                    data={data}
                    setData={setData}
                    uploadFunction={uploadFunction}
                    dataStructure={dataStructure}
                    fileType={".csv"}
                />
              </Flex>

          </Grid>
          <Box overflowX="auto" w="full"  >
              <DataTable 
                      value={data}
                      tableStyle={{ 
                          minWidth: '100%',
                          minBlockSize: '200px',
                          fontSize: "0.875rem",
                      }}
                      loading={!data || data.length === 0}
                      filters={filters}
                      filterDisplay='row'
                      paginator 
                      rows={10}
                      editMode='row'
                      onRowEditComplete={(rowData)=>{
                        editFunction(rowData.data.id, rowData.newData)
                        setData(data.map(item => item.id === rowData.data.id ? rowData.newData : item))
                      }}
                      emptyMessage="Ningún dato encontrado."
                      scrollable
                      removableSort 
                      scrollHeight="1900px"
                  >
                      {
                          columns?.map((column, index) => (
                              // Check if the column field is in the hideColumn array
                              !hideColumn?.includes(column.field) && 
                              <Column 
                                  key={index} 
                                  field={column.field} 
                                  header={column.header} 
                                  filter
                                  sortable
                                  showFilterMatchModes={false}
                                  filterElement={
                                    // Check if the column field is in the dropdownColumn array
                                    dropdownColumn?.some(dropdownItem => dropdownItem.field === column.field)
                                        ? dropdownRowFilterTemplate 
                                        : undefined
                                    }
                                  filterPlaceholder={`Buscar por ${column.header.toLowerCase()}...`} 
                                  body={isDate?.includes(column.field) ? dateBodyTemplate : undefined}
                                  editor={(options)=>handleEdit(options)}
                                  style={{ 
                                    fontSize: "0.875rem",
                                    minWidth: '200px'
                                }}
                              /> 
                          ))
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
                                    deleteFunction(rowData.id)
                                    setData(data.filter(item => item.id !== rowData.id))
                                }} >
                                    <MdDelete />
                                </Button>)} 
                        />
                      }
              </DataTable>
          </Box>
          
      </Box>
  );
};

export default StandardTable;
