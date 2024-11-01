'use client'
import { createClient } from '@/utils/supabase/cliente'
import { useState, useEffect, useRef } from 'react';

const useSupabaseChannel = (channels) => {
  const [isSubscribed, setIsSubscribed] = useState({});
  const supabase = createClient();
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    // Clear any existing subscriptions
    subscriptionsRef.current.forEach(channel => channel.unsubscribe());
    subscriptionsRef.current = [];
    
    // Create new subscriptions
    const newSubscriptions = channels.map(({ channelName, schema, table, event, callback }) => {
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', { schema, table, event }, callback)
        .subscribe();

      return channel;
    });

    // Update subscriptions ref and state
    subscriptionsRef.current = newSubscriptions;
    setIsSubscribed(
      channels.reduce((acc, { channelName }) => ({
        ...acc,
        [channelName]: true
      }), {})
    );

    // Cleanup function
    return () => {
      subscriptionsRef.current.forEach(channel => channel.unsubscribe());
      subscriptionsRef.current = [];
      setIsSubscribed({});
    };
  }, [JSON.stringify(channels)]); // Stable dependency

  return { isSubscribed };
};

export default useSupabaseChannel;