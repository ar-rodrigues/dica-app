'use client'
import { ChakraProvider } from '@chakra-ui/react'
import { UserRoleContext } from './contexts'
import { checkUserRole } from './login/actions'
import { useState, useEffect } from 'react'
export function Providers({ children }) {  
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await checkUserRole()
      
      setUserRole(role)
    }
    fetchUserRole()

  }, [])
  return <UserRoleContext.Provider value={{ userRole }}><ChakraProvider >{children}</ChakraProvider></UserRoleContext.Provider>
}