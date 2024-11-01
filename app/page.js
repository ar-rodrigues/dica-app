'use client'
import Image from "next/image";
import { Flex, Box, Text, Button, VStack, HStack, Link } from "@chakra-ui/react";
import Logo from "@/public/DICA_LogoVector.png";

export default function Home() {
  return (
    <Box w="100%" h="100vh" color="gray.800" bgGradient="linear(to-b, white, gray.100)">
      {/* Header */}
      <Flex as="header" p={6} align="center" justify="space-between" bg="white" boxShadow="md">
        <HStack spacing={4}>
          <Image src={Logo} alt="DICA Logo" width={100} height={100} />
        </HStack>
        <HStack spacing={8}>
          <Link href="#about" fontWeight="medium" _hover={{ color: "gray.500" }}>Sobre Nosotros</Link>
          <Link href="#services" fontWeight="medium" _hover={{ color: "gray.500" }}>Servicios</Link>
          <Link href="#contact" fontWeight="medium" _hover={{ color: "gray.500" }}>Contacto</Link>
          <Button colorScheme="blue" variant="solid">Acceder</Button>
        </HStack>
      </Flex>

      {/* Hero Section */}
      <Flex
        id="hero"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        h="80vh"
        bgGradient="linear(to-b, blue.600, blue.400)"
        color="white"
      >
        <VStack spacing={6} maxW="lg" mx="auto">
          <Text fontSize="4xl" fontWeight="bold">Bienvenido a DICA</Text>
          <Text fontSize="lg" opacity="0.85">
            Tu socio confiable para soluciones innovadoras y auditoría.
          </Text>
          <Button colorScheme="blue" variant="solid" size="lg" color={"blue.400"} bg={"white"} _hover={{ bg: "blue.700", color: "white" }} onClick={() => window.location.href = "/login"} >
            Acceder
          </Button>
        </VStack>
      </Flex>

      {/* Call to Action Section */}
      <Flex
        id="cta"
        direction="column"
        align="center"
        justify="center"
        textAlign="center"
        p={8}
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold">Listo para la transformación digital?</Text>
          <Text fontSize="md" maxW="lg" opacity="0.75">
            Únete a nosotros en un viaje hacia la innovación y la excelencia. Contáctanos hoy para empezar con DICA.
          </Text>
          <Button colorScheme="blue" size="md">Contáctanos</Button>
        </VStack>
      </Flex>
    </Box>
  );
}
