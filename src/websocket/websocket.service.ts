import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface ClientInfo {
  id: string;
  socket: Socket;
  connectedAt: Date;
  rooms: string[];
}

@Injectable()
export class WebsocketService {
  private logger = new Logger('WebsocketService');
  private server: Server;
  private clients: Map<string, ClientInfo> = new Map();

  setServer(server: Server) {
    this.server = server;
    this.logger.log('Socket.IO server instance set in WebsocketService');
  }

  addClient(client: Socket): void {
    const clientInfo: ClientInfo = {
      id: client.id,
      socket: client,
      connectedAt: new Date(),
      rooms: Array.from(client.rooms).filter((room) => room !== client.id),
    };

    this.clients.set(client.id, clientInfo);
    this.logger.log(
      `Client added: ${client.id}. Total clients: ${this.clients.size}`,
    );
  }

  // Method to update client rooms when they join/leave
  updateClientRooms(clientId: string, rooms: string[]): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.rooms = rooms;
    }
  }

  removeClient(clientId: string): void {
    const removed = this.clients.delete(clientId);
    if (removed) {
      this.logger.log(
        `Client removed: ${clientId}. Total clients: ${this.clients.size}`,
      );
    }
  }

  getClient(clientId: string): ClientInfo | undefined {
    return this.clients.get(clientId);
  }

  getAllClients(): ClientInfo[] {
    return Array.from(this.clients.values());
  }

  getClientsCount(): number {
    return this.clients.size;
  }

  sendToClient(clientId: string, event: string, data: any): boolean {
    const client = this.clients.get(clientId);
    if (client) {
      client.socket.emit(event, data);
      return true;
    }
    return false;
  }

  sendToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
    this.logger.log(`Sent event '${event}' to room '${room}'`);
  }

  broadcast(event: string, data: any): void {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted event '${event}' to all clients`);
  }

  getClientRooms(clientId: string): string[] {
    const client = this.clients.get(clientId);
    return client ? client.rooms : [];
  }

  getServer(): Server {
    return this.server;
  }

  // Utility method to check if server is initialized
  isServerInitialized(): boolean {
    return !!this.server;
  }
}
