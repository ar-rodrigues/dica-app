'use client';
import { Box, Flex, Heading, Text, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { checkUserRole } from '@/login/actions';
import Image from 'next/image';
import Logo from '@/public/GOB_VER_Escudo.png';
export default function Home() {
  const [role, setRole] = useState();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await checkUserRole();
        setRole(response);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchRole();
  }, []);

  if (!role) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex direction="column" align="center">
        <Heading as="h1" size="2xl" mb={4}>
          <Flex
            align="center"
            justify="center"
            height="100vh"
            direction="column"
            gap={4}
          >
            <Text
              fontSize="3xl"
              fontWeight="bold"
              mb={4}
              color="teal.500"
              textAlign="center"
            >
              Hola, {role?.fullName}!
            </Text>
            <Image
              src={Logo}
              width={100}
              height={100}
              alt="Logo"
              priority={false}
            />
          </Flex>
        </Heading>
        <Text fontSize="xl">You are successfully logged in.</Text>
      </Flex>
    </Box>
  );
}
