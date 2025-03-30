import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { WellInfo } from '@shared/schema';
import { witsClient } from '@/lib/wits-client';
import { useToast } from '@/hooks/use-toast';

interface WellContextType {
  wellInfo: WellInfo | null;
  loading: boolean;
  error: string | null;
  updateWellInfo: (updatedInfo: Partial<WellInfo>) => Promise<void>;
}

const WellContext = createContext<WellContextType>({
  wellInfo: null,
  loading: true,
  error: null,
  updateWellInfo: async () => {}
});

export const useWellContext = () => useContext(WellContext);

export const WellProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wellInfo, setWellInfo] = useState<WellInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch well info that can be called anytime
  const fetchWellInfo = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('GET', '/api/well-info', undefined);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setWellInfo(data[0]);
      }
    } catch (err) {
      console.error('Error fetching well info:', err);
      setError('Failed to load well information');
      toast({
        title: "Error",
        description: "Failed to load well information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Initial fetch
    fetchWellInfo();

    // Set up WebSocket handler for well info updates
    witsClient.onWellInfo((data) => {
      console.log('WebSocket well info update received:', data);
      setWellInfo(data);
    });
    
    // Set up reconnection handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-fetch data when tab becomes visible again
        fetchWellInfo();
        
        // Ensure WebSocket connection is active
        witsClient.connect().catch(console.error);
      }
    };
    
    // Handle tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Setup heartbeat to periodically refresh data
    const heartbeat = setInterval(() => {
      fetchWellInfo();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
    };
  }, [toast]);

  const updateWellInfo = async (updatedInfo: Partial<WellInfo>) => {
    if (!wellInfo) return;
    
    try {
      setLoading(true);
      const response = await apiRequest('PATCH', `/api/well-info/${wellInfo.id}`, updatedInfo);
      const updatedWellInfo = await response.json();
      setWellInfo(updatedWellInfo);
      toast({
        title: "Success",
        description: "Well information updated successfully",
      });
    } catch (err) {
      console.error('Error updating well info:', err);
      setError('Failed to update well information');
      toast({
        title: "Error",
        description: "Failed to update well information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <WellContext.Provider value={{ wellInfo, loading, error, updateWellInfo }}>
      {children}
    </WellContext.Provider>
  );
};
