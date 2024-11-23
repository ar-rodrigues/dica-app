// components/LogoutButton.js
'use client';
import { useState } from 'react';
import { Button, Spinner, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { IoIosLogOut } from "react-icons/io";


export default function LogoutButton({isTextVisible}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/login'); // Redirect to login on success
      } else {
        setError(result.message); // Display error message
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={handleLogout} colorScheme='red' size='sm' w={"100%"} fontSize={"93%"} mt={4} mb={4} isDisabled={loading} >
        {loading ? <Spinner size="sm" /> : isTextVisible ? "Salir" : <IoIosLogOut />}
      </Button>
      {error && <Text color="red.500">{error}</Text>}
    </div>
  );
}