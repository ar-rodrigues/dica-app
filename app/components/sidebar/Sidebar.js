'use client';

// Imports necessary modules for React components, routing, context management, and styling.
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import { Box, VStack, Button, useBreakpointValue, Text } from '@chakra-ui/react';
import { UserRoleContext } from '@/contexts';
import LogoutButton from '@/components/logout/LogoutButton';
import SidebarLink from './SidebarLink';
// Import icons for sidebar navigation.
import { FiHome, FiUsers } from 'react-icons/fi'; 
import { AiOutlineAudit } from "react-icons/ai";
import { MdOutlinePhonelinkSetup, MdComputer, MdDataThresholding  } from "react-icons/md";
import { GoSidebarExpand, GoSidebarCollapse  } from "react-icons/go";

// Define the Sidebar component
const Sidebar = () => {
  // Get the current pathname for active link highlighting.
  const pathname = usePathname();
  // Access user role from the context.
  const { userRole } = useContext(UserRoleContext);
  const { fullName, role, email, isAdmin } = userRole || {}   // Destructure user role information.
 
  // Use breakpoint value to set initial text visibility based on screen size.
  const initialTextVisible = useBreakpointValue({ base: false, md: true });
  // State to manage text visibility for sidebar links.
  const [isTextVisible, setIsTextVisible] = useState(initialTextVisible); 

  // Update text visibility state based on screen size changes.
  useEffect(() => {
    setIsTextVisible(initialTextVisible);
  }, [initialTextVisible]);
  
  // If the current path is '/login', return null (sidebar not needed for login page).
  if (pathname === '/login') return null;

  if (pathname === '/' && !role) return null

  // Define an array of links for sidebar navigation.
  // Each link object contains information about the href, text, icon, and roles that can access it.
  const links = [
    { href: '/', text: 'Panel', icon: MdDataThresholding , roles: ['admin', 'auditor'] },
    { href: '/setup', text: 'Setup', icon: MdOutlinePhonelinkSetup, roles: ['admin'] },
    { href: '/users', text: 'Usuários', icon: FiUsers, roles: ['admin'] },
    { href: '/auditor', text: 'Auditor', icon: AiOutlineAudit, roles: ['admin', 'auditor'] },
  ];

  return (
    // Create a Box element for the sidebar container.
    <Box
      as="nav"
      bgGradient="linear(to-r, blackAlpha.800, gray.800)" // Set background gradient.
      color="white"
      w={{  base: '10%', // Use percentage width for sidebar on smaller screens
        md: '200px', // Keep fixed width for larger screens
        sm: '15%' // Use percentage width for smaller screens
      }}
      p="4"
      position={"static"}
      h={"100%"}
      minH={"100%"}
      minW={isTextVisible ? "200px" : "80px"} // Set minimum width based on text visibility
      overflow={"hidden"}
    >
    {/* Create a button for toggling sidebar text visibility. */}
      <Button
        colorScheme="teal"
        size='sm' w={"auto"} fontSize={"100%"} mt={4} mb={4}
        onClick={() => setIsTextVisible(!isTextVisible)} 
      >
        { // Display appropriate icon based on text visibility
          isTextVisible ? 
          <GoSidebarExpand /> : <GoSidebarCollapse /> }
      </Button>

      {/* Create a vertical stack for sidebar content. */}
      <VStack align="start" spacing="4" pb="10" pt="10" justify="flex-start" h="100%">
        { //Display welcome message with user role if text is visible
            isTextVisible && userRole && <Text>Bienvenido {role}</Text>
        }

        {/* Create a vertical stack for sidebar links. */}
        <VStack align="stretch" spacing="6" w="100%">
          {/* Filter links based on user role and map them to SidebarLink components. */}
          {
            links
            .filter(link => link.roles.includes(role || '')) // Filter links based on the user's role
            .map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                text={link.text}
                icon={link.icon}
                isActive={pathname === link.href}
                isTextVisible={isTextVisible}
              />
            ))}

          {/* Display the LogoutButton component. */}
          <LogoutButton isTextVisible={isTextVisible} />
        </VStack>
        
      </VStack>
    </Box>
  );
};

export default Sidebar;