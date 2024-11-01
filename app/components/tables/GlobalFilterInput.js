import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from 'primereact/api';
import { InputGroup, InputLeftElement } from "@chakra-ui/react"
import { FiSearch } from "react-icons/fi"

export default function GlobalFilterInput({setFilters, filters}) {

    return (
        <InputGroup size="md" width={{ base: "100%", md: "300px" }} mb={4} >
            <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
            </InputLeftElement>
            <InputText
                type="search"
                onInput={(e) =>
                setFilters((prev) => ({
                    ...prev,
                    global: { value: e.target.value, matchMode: FilterMatchMode.CONTAINS },
                }))
                }
                placeholder="Buscar..."
                className="w-full"
                style={{
                padding: '.51rem .51rem .51rem 2.5rem',
                borderRadius: '0.375rem',
                border: '5px solid #E2E8F0',
                fontSize: '.875rem',
                
                }}
                />
            </InputGroup>
    )
    
};
