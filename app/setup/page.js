'use client';
import { Box, Flex, Heading, Text, Spinner } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { UserRoleContext } from '@/contexts';
import useSupabaseChannel from '@/utils/hooks/useSupabaseChannel';

import {
  fetchSetup,
  createSetup,
  updateSetup,
  deleteSetup,
} from '@/api/setups/setups';
import StandardTable from '@/components/tables/StandardTable';
export default function Setup() {
  const { userRole } = useContext(UserRoleContext);
  const { fullName, role, email, isAdmin } = userRole || {};
  const [setups, setSetups] = useState([]);
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);

  const channels = [
    {
      channelName: 'setups-channel',
      schema: 'public',
      table: 'setups_v2',
      event: '*',
      callback: (payload) => {
        const newSetup = payload.new;
        const oldSetup = payload.old;
        console.log('Change received:', payload);
        if (payload.eventType === 'INSERT') {
          if (!setups.some((setup) => setup.id === newSetup.id)) {
            setSetups((prevSetups) => [...prevSetups, newSetup]);
          }
        } else if (payload.eventType === 'UPDATE') {
          setSetups((prevSetups) =>
            prevSetups.map((setup) =>
              setup.id === newSetup.id ? newSetup : setup,
            ),
          );
        } else if (payload.eventType === 'DELETE') {
          setSetups((prevSetups) =>
            prevSetups.filter((setup) => setup.id !== oldSetup.id),
          );
        }
      },
    },
  ];

  const { isSubscribed } = useSupabaseChannel(channels);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSetup();
        let newColumns;
        if (data.data && data.data.length > 0) {
          // headers for the columns of the table
          const headers = data.headers;
          const nameHeaders = data.nameHeaders;
          const headerTypes = data.headerTypes;
          newColumns = headers.map((key, index) => ({
            field: key,
            header: nameHeaders[index],
            type: headerTypes[index],
          }));
        }
        setSetups(data.data);
        setColumns(newColumns);
      } catch (err) {
        console.error('Error fetching setups:', err);
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  if (!userRole || !setups) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box w={'100%'} h={'100%'} p={4} mt={10} mb={10}>
      <Flex direction="column" align="center">
        <Heading as="h1" size="2xl" mb={4}>
          Hola {userRole ? fullName : ''} !
        </Heading>
        <Text fontSize="xl">Has accedido con exito.</Text>
      </Flex>
      <Flex direction="column" align="center" mt={8}>
        <Heading as="h2" size="xl" mb={4}>
          Setups
        </Heading>
        <Box w="100%" overflowX="auto" mb={8}>
          {setups && (
            <StandardTable
              data={setups}
              setData={setSetups}
              columns={columns}
              title={'Setup'}
              hideColumn={['id', 'created_at', 'closed_at', 'documents']}
              dateColumn={['created_at', 'closed_at']}
              uploadFunction={createSetup}
              dataStructure={columns}
              editFunction={updateSetup}
              deleteFunction={deleteSetup}
            />
          )}
        </Box>
      </Flex>
    </Box>
  );
}
