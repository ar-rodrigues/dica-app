import { Link, Flex, Box, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

const SidebarLink = ({ href, text, icon, isActive, isTextVisible     }) => {
  const activeStyle = {
    bg: 'gray.600',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: 'md',
    w: 'auto'
  };

  return (
    <Link
      as={NextLink}
      href={href}
      _hover={{ bg: 'white', color: 'black', borderRadius: 'md' }}
      p="2"
      w="auto"
      sx={isActive ? activeStyle : {}}
    >
      <Flex align="center">
        <Box as={icon} mr="2" w={"auto"} h={5} flexShrink={0} />
        {isTextVisible && <Text>{text}</Text>}
      </Flex>
    </Link>
  );
};

export default SidebarLink;