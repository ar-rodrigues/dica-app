'use client'
import { useContext, useEffect, useState } from 'react';
import { Box, Flex, Heading, Text, Spinner, Button, useDisclosure } from '@chakra-ui/react';
import Modal from '@/components/modal/Modal'

//import LogoutButton from '@/components/logout/LogoutButton';
import { fetchUsers, createUser, deleteUser, updateUser } from '@/api/users/users'
import { fetchRoles } from '@/api/roles/roles'
import { UserRoleContext } from '@/contexts';
import StandardTable from '@/components/tables/StandardTable';
export default function Users() {
  const { userRole } = useContext(UserRoleContext);
  const { fullName, role, email, isAdmin } = userRole || {}
  const [ users, setUsers ] = useState()
  const [ roles, setRoles ] = useState([])
  const [ columns, setColumns ] = useState([])
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect( () => {
    const fetchData = async () => {
      try {
        const usersData = await fetchUsers()
        const rolesData = await fetchRoles()
        if (usersData.data && usersData.data.length > 0) {
          // headers for the columns of the table
          const headers = usersData.headers
          const nameHeaders = usersData.nameHeaders
          const headerTypes = usersData.headerTypes
          const newColumns = headers.map((key, index) => ({ field: key, header: nameHeaders[index], type: headerTypes[index] }));
            setColumns(newColumns);
        }
        setRoles(rolesData)
        setUsers(usersData.data)
        
      } catch (error) {
        console.error('Error fetching users:', error)
    }}
    fetchData()
  }, [])


  if (!userRole) {
    return <Flex justify="center" align="center" h="100vh"><Spinner size="xl" /></Flex>
  }
  
  return (
      <Flex direction="column" align={"center"} h={"100vh"} p={4}>
        <Heading as="h1" size="2xl" mt={4} mb={4}>
          Welcome {userRole? fullName : ""} !
        </Heading>
        <Text fontSize="xl">
          You are successfully logged in.
        </Text>

        <Button onClick={onOpen}>Crear Usuario</Button>
        <Modal 
            isOpen={isOpen}
            onClose={onClose}
            title="Nuevo Usuario"
            submitFunction={createUser} 
            dataStructure={[...columns,{field:'password', type: 'string', header: 'Contraseña'}]} 
            roles={roles}
            users={users}
            setUsers={setUsers}
            hideFields={['id', 'role']}
          />
        <StandardTable 
          data={users} 
          setData={setUsers}
          columns={columns} 
          title={"Usuarios"} 
          hideColumn={['id']}
          dropdownColumn={[{field:'role_name', options:roles?.map(role=>role.role_name)}, {field: "role", options: ["1","2"]}]}
          isDate={["birthday"]}
          uploadFunction={createUser}
          dataStructure={columns}
          editFunction={updateUser}
          deleteFunction={deleteUser}
        />
      </Flex>
  );
}
