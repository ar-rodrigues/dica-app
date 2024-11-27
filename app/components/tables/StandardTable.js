import { useState } from 'react';
import moment from 'moment';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Box, Text, Flex, Grid, Button, Spinner } from '@chakra-ui/react';
import { SingleDatepicker } from 'chakra-dayzed-datepicker';
import { parseISO } from 'date-fns';
import { MdDelete, MdModeEdit } from 'react-icons/md';
import GlobalFilterInput from './GlobalFilterInput';
import FileUploadButton from './FileUploadButton';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import ImportSheetsButton from '../buttons/ImportSheetsButton';

const StandardTable = ({
  data,
  setData,
  columns,
  title,
  hideColumn,
  dropdownColumn,
  isDate,
  dataStructure,
  uploadFunction,
  editFunction,
  deleteFunction,
}) => {
  const [editValue, setEditValue] = useState();
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    ...columns?.reduce(
      (acc, column) => ({
        ...acc,
        [column.field]: { value: null, matchMode: FilterMatchMode.CONTAINS },
      }),
      {},
    ),
  });

  const arrayTypes = ['array', 'jsonb', 'json'];
  const dateTypes = ['timestamp with time zone'];

  const dateBodyTemplate = (rowData) => {
    const dateField =
      columns?.find(({ type }) => dateTypes.includes(type))?.field || null;
    return dateField ? moment(rowData[dateField]).format('DD/MM/YYYY') : null;
  };

  const arrayBodyTemplate = (rowData) => {
    const arrayField =
      columns?.find(({ type }) => arrayTypes.includes(type))?.field || null;
    return arrayField ? (
      <Flex flexWrap={'wrap'} gap={1} minW={'500px'}>
        {rowData[arrayField]?.map((item) => {
          let itemSubstring = item?.split('-');
          return (
            <Tag
              severity="success"
              rounded
              size="sm"
              key={item}
              value={itemSubstring[0] || item}
            />
          );
        })}
      </Flex>
    ) : null;
  };

  const dropdownRowFilterTemplate = (options) => {
    const dropdownOptions =
      dropdownColumn?.find((item) => item.field === options.field)?.options ||
      [];
    // Dropdown filter
    return (
      <Dropdown
        value={options.value}
        onChange={(e) => options.filterApplyCallback(e.value)}
        options={dropdownOptions}
        placeholder="Selecciona"
        className="p-column-filter"
        showClear
      />
    );
  };

  const handleEdit = (rowData) => {
    const dropdownOptions =
      dropdownColumn?.find((item) => item.field === rowData.field)?.options ||
      [];
    // Check for date values to modify
    const isDateValue =
      columns?.find(({ type }) => dateTypes.includes(type))?.field ===
      rowData.field
        ? rowData.value && parseISO(moment(rowData.value).toISOString())
        : null;

    const isNumber =
      columns
        ?.filter((item) => item.type === 'number')
        ?.map((item) => item.field) || null;

    const isArray = columns?.filter(({ type }) =>
      arrayTypes?.includes(type),
    )?.field;

    return dropdownColumn?.find((item) => item.field === rowData.field) ? (
      <Dropdown
        value={rowData.value || ''}
        onChange={(e) => rowData.editorCallback(e.value)}
        options={dropdownOptions}
        className="p-column-filter"
      />
    ) : isDateValue ? (
      <SingleDatepicker
        name="date-input"
        date={isDateValue || null}
        onDateChange={(e) => rowData.editorCallback(e)}
        configs={{
          dateFormat: 'dd-MM-yyyy',
          dayNames: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
          monthNames: [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre',
          ],
        }}
      />
    ) : isArray?.includes(rowData.type) ? (
      <InputText
        value={rowData.value?.join(',') || ''}
        type="text"
        onChange={(e) => {
          let values = e.target.value
            .split(',')
            .map((item) => item.trimStart());
          rowData.editorCallback(values);
        }}
      />
    ) : (
      <InputText
        value={
          isNumber.includes(rowData.field)
            ? parseInt(rowData.value)
            : rowData.value
        }
        type={isNumber.includes(rowData.field) ? 'number' : 'text'}
        onChange={(e) => rowData.editorCallback(e.target.value)}
      />
    );
  };

  if (!data) {
    return (
      <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );
  }

  return (
    <Box w="full" p={4}>
      <Grid
        gridRow={2}
        gridColumn={2}
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap={4}
        m={10}
      >
        <Flex
          flexDir={'column'}
          align="flex-start"
          justify="space-between"
          mb={4}
        >
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            {title}
          </Text>

          <GlobalFilterInput filters={filters} setFilters={setFilters} />
        </Flex>

        <Flex alignItems={'center'} justifyContent={'flex-end'}>
          <FileUploadButton isExport={true} data={data} tableName={title} />
          <ImportSheetsButton uploadFunction={uploadFunction} />
        </Flex>
      </Grid>
      <Box overflowX="auto" w="full">
        {data.length === 0 && (
          <Text textAlign={'center'} fontSize={'md'}>
            Cargando...
          </Text>
        )}
        {data.length > 0 && (
          <DataTable
            value={data}
            tableStyle={{
              minWidth: '90%',
              minBlockSize: '30px',
              fontSize: '0.475rem',
            }}
            loading={!data || data.length === 0}
            filters={filters}
            filterDisplay="row"
            paginator
            rows={20}
            editMode="row"
            onRowEditComplete={(rowData) => {
              editFunction(rowData.data.id, rowData.newData);
              setData(
                data.map((item) =>
                  item.id === rowData.data.id ? rowData.newData : item,
                ),
              );
            }}
            emptyMessage="Ningún dato encontrado."
            scrollable
            removableSort
            scrollHeight="90vh"
          >
            {columns?.map(
              ({ field, header, type }, index) =>
                // Show only field that are not in hideColumn
                !hideColumn?.includes(field) && (
                  <Column
                    key={index}
                    field={field}
                    header={header}
                    //filter
                    sortable
                    showFilterMatchModes={false}
                    filterElement={
                      // Check if the column field is in the dropdownColumn array
                      dropdownColumn?.includes(field)
                        ? dropdownRowFilterTemplate
                        : null
                    }
                    filterPlaceholder={`Buscar por ${header.toLowerCase()}...`}
                    body={
                      dateTypes?.includes(type)
                        ? dateBodyTemplate
                        : arrayTypes?.includes(type)
                        ? arrayBodyTemplate
                        : null
                    }
                    editor={(options) => handleEdit(options)}
                    style={{
                      fontSize: '0.475rem',
                      minWidth: '60px',
                    }}
                  />
                ),
            )}
            {editFunction && (
              <Column header="Editar" frozen alignFrozen="right" rowEditor />
            )}
            {deleteFunction && (
              <Column
                header="Eliminar"
                frozen
                alignFrozen="right"
                body={(rowData) => (
                  <Button
                    onClick={() => {
                      deleteFunction(rowData.id);
                      setData(data.filter((item) => item.id !== rowData.id));
                    }}
                  >
                    <MdDelete />
                  </Button>
                )}
              />
            )}
          </DataTable>
        )}
      </Box>
    </Box>
  );
};

export default StandardTable;
