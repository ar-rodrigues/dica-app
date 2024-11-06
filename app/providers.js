'use client'
import { ChakraProvider } from '@chakra-ui/react'
import { UserRoleContext } from './contexts'
import { checkUserRole } from '@/login/actions'
import { useState, useEffect, use } from 'react'
export function Providers({ children }) {  
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    if (!userRole) {
      checkUserRole().then(role => setUserRole(role));
    }
  }, []);

  const contextValue = {
    userRole,
    checkUserRole,
  };
  return <UserRoleContext.Provider value={contextValue}><ChakraProvider >{children}</ChakraProvider></UserRoleContext.Provider>
}