'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublicPageClient() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/events');
    
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log('Connected to updates');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received SSE data:', data);
        
        if (data.type === 'ronda_estado_cambiado') {
          console.log('Ronda state changed, reloading page...');
          // Reload the page to get updated data
          window.location.reload();
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [router]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
           title={isConnected ? 'Conectado - Actualizaciones automáticas' : 'Desconectado - Recargando...'} />
    </div>
  );
}
