'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, checkUserRole } from './actions';
import { Input, Button, Box, Heading, InputGroup, InputRightElement, IconButton, Text, Spinner, Flex } from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import Image from 'next/image';
import Logo from '@/public/DICA_LogoVector.png'
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // Use Next.js router for client-side redirection

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);

    try {
      const result = await login(formData);
      console.log(result)
      if (!result.success) {
        setError('Credenciales incorrectas. Intente otra vez.');
      } else {
        const userRole = await checkUserRole()
        if(userRole.role) router.push('/home');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setTimeout(() => {
        setError(null);
      }, 3000);
      setLoading(false);
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-200">
      <Heading as="h1" size="xl" mb={6}>
        <Flex flexDir={"column"} justify={"center"} align={"center"} gap={2}>
          <Text as="span" color="blue.900" fontWeight="bold" fontSize="2xl" className="text-4xl font-bold text-blue-500">
            Iniciar sesión
          </Text>
          <Image 
            src={Logo} 
            width={100}
            height={100}
            alt="Logo" 
            priority
          />
        </Flex>
      </Heading>
      <form className="space-y-4" onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Correo"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
          required
          name="email"
          id="email"
        />
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value.trim() })}
            required
            name="password"
            id="password"
          />
          <InputRightElement w="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            />
          </InputRightElement>
        </InputGroup>
        <Button
          type="submit"
          colorScheme="blue"
          w="full"
          isLoading={loading}
        >
          {loading ? <Spinner /> : 'Login'}
        </Button>
        {error && <Text color="red.500">{error}</Text>}
      </form>
    </Box>
  );
};

export default Login;