'use client'
import { Box, Flex, Heading, Text, Spinner } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { UserRoleContext } from '@/contexts';
export default function Home() {
  const { userRole } = useContext(UserRoleContext);
  const [ role, setRole ] = useState({})

  useEffect(() => {
    if (userRole) {
      setRole(userRole.role)
    }
  },[userRole])


  if (!userRole) {
    return <Flex justify="center" align="center" height="100vh"><Spinner size="xl" /></Flex>
  }
  
  return (
    <Box p={4}>
      <Flex direction="column" align="center">
        <Heading as="h1" size="2xl" mb={4}>
          Bienvenid@ {role? userRole.fullName : ""} !
        </Heading>
        <Text fontSize="xl">
          You are successfully logged in.
        </Text>
      </Flex>
    </Box>
  );
}
