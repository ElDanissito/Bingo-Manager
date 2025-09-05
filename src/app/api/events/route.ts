import { NextRequest } from 'next/server';

// Store active connections
const connections = new Set<ReadableStreamDefaultController>();

// Make broadcastUpdate available globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).broadcastUpdate = broadcastUpdate;

export async function GET(request: NextRequest) {
  console.log('New SSE connection established');
  
  const stream = new ReadableStream({
    start(controller) {
      // Add this connection to our set
      connections.add(controller);
      console.log(`Total connections: ${connections.size}`);
      
      // Send initial data
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      
      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        console.log('Client disconnected');
        connections.delete(controller);
        controller.close();
      });
    },
    cancel(controller) {
      console.log('Stream cancelled');
      connections.delete(controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

// Function to broadcast updates to all connected clients
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function broadcastUpdate(type: string, data: any) {
  console.log(`Broadcasting update: ${type}`, data);
  const message = `data: ${JSON.stringify({ type, data })}\n\n`;
  
  connections.forEach(controller => {
    try {
      controller.enqueue(new TextEncoder().encode(message));
      console.log('Message sent to client');
    } catch (error) {
      console.error('Error sending message to client:', error);
      // Remove dead connections
      connections.delete(controller);
    }
  });
  
  console.log(`Active connections: ${connections.size}`);
}
