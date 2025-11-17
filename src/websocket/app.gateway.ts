import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { WebsocketService } from './websocket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.websocketService.setServer(server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.websocketService.addClient(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.websocketService.removeClient(client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room: ${data.room}`);

    // Update client rooms in service
    this.websocketService.updateClientRooms(
      client.id,
      Array.from(client.rooms).filter((room) => room !== client.id),
    );

    // Notify room that a new user has joined
    client.to(data.room).emit('userJoined', {
      clientId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'joinedRoom',
      data: {
        room: data.room,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room: ${data.room}`);

    // Update client rooms in service
    this.websocketService.updateClientRooms(
      client.id,
      Array.from(client.rooms).filter((room) => room !== client.id),
    );

    // Notify room that a user has left
    client.to(data.room).emit('userLeft', {
      clientId: client.id,
      room: data.room,
      timestamp: new Date().toISOString(),
    });

    return {
      event: 'leftRoom',
      data: {
        room: data.room,
        clientId: client.id,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: string },
  ) {
    this.logger.log(
      `Message from ${client.id} in room ${data.room}: ${data.message}`,
    );

    const messageData = {
      clientId: client.id,
      room: data.room,
      message: data.message,
      timestamp: new Date().toISOString(),
    };

    // Broadcast message to all clients in the room (including sender)
    this.server.to(data.room).emit('newMessage', messageData);

    return {
      event: 'messageSent',
      data: messageData,
    };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  }
}
