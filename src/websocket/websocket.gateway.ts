/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  handleJoinTracking(data: { trackingId: string }, client: Socket) {
    client.join(`tracking-${data.trackingId}`);
    this.connectedClients.set(client.id, client);
    return { event: 'joined-tracking', data: { trackingId: data.trackingId } };
  }

  handleJoinAgent(data: { agentId: string }, client: Socket) {
    client.join(`agent-${data.agentId}`);
    this.connectedClients.set(client.id, client);
    return { event: 'joined-agent', data: { agentId: data.agentId } };
  }

  // Emit parcel status update to all clients tracking this parcel
  emitParcelStatusUpdate(trackingId: string, data: any) {
    this.connectedClients.forEach((client) => {
      client.to(`tracking-${trackingId}`).emit('parcel-status-update', data);
    });
  }

  // Emit location update to all clients tracking this parcel
  emitLocationUpdate(trackingId: string, data: any) {
    this.connectedClients.forEach((client) => {
      client.to(`tracking-${trackingId}`).emit('location-update', data);
    });
  }

  // Emit agent status update
  emitAgentStatusUpdate(agentId: string, data: any) {
    this.connectedClients.forEach((client) => {
      client.to(`agent-${agentId}`).emit('agent-status-update', data);
    });
  }
}
