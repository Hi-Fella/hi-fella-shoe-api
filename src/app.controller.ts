import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { EmailService } from './email/email.service';
import { WebsocketService } from './websocket/websocket.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
    private readonly websocketService: WebsocketService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-email')
  async testEmail(): Promise<string> {
    try {
      await this.emailService.sendTestEmail();
      return 'Test email sent successfully!';
    } catch (error) {
      return `Failed to send test email: ${error.message}`;
    }
  }

  // Socket.IO Examples

  @Post('broadcast')
  broadcastMessage(@Body() data: { message: string; event?: string }): {
    success: boolean;
    message: string;
  } {
    try {
      const event = data.event || 'notification';
      const messageData = {
        message: data.message,
        timestamp: new Date().toISOString(),
        source: 'HTTP API',
      };

      this.websocketService.broadcast(event, messageData);

      return {
        success: true,
        message: `Message broadcasted to all connected clients via event '${event}'`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to broadcast message: ${error.message}`,
      };
    }
  }

  @Post('send-to-room/:room')
  sendToRoom(
    @Param('room') room: string,
    @Body() data: { message: string; event?: string },
  ): { success: boolean; message: string } {
    try {
      const event = data.event || 'roomMessage';
      const messageData = {
        room,
        message: data.message,
        timestamp: new Date().toISOString(),
        source: 'HTTP API',
      };

      this.websocketService.sendToRoom(room, event, messageData);

      return {
        success: true,
        message: `Message sent to room '${room}' via event '${event}'`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send message to room: ${error.message}`,
      };
    }
  }

  @Get('websocket-stats')
  getWebsocketStats(): {
    connectedClients: number;
    isServerInitialized: boolean;
    clients: Array<{ id: string; rooms: string[]; connectedAt: string }>;
  } {
    const clients = this.websocketService.getAllClients();

    return {
      connectedClients: this.websocketService.getClientsCount(),
      isServerInitialized: this.websocketService.isServerInitialized(),
      clients: clients.map((client) => ({
        id: client.id,
        rooms: client.rooms,
        connectedAt: client.connectedAt.toISOString(),
      })),
    };
  }

  @Post('trigger-notification')
  triggerNotification(
    @Body()
    data: {
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      targetRoom?: string;
      targetClientId?: string;
    },
  ): { success: boolean; message: string } {
    try {
      const notificationData = {
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: new Date().toISOString(),
        source: 'HTTP API',
      };

      if (data.targetClientId) {
        const sent = this.websocketService.sendToClient(
          data.targetClientId,
          'notification',
          notificationData,
        );
        return {
          success: sent,
          message: sent
            ? `Notification sent to client '${data.targetClientId}'`
            : `Client '${data.targetClientId}' not found`,
        };
      } else if (data.targetRoom) {
        this.websocketService.sendToRoom(
          data.targetRoom,
          'notification',
          notificationData,
        );
        return {
          success: true,
          message: `Notification sent to room '${data.targetRoom}'`,
        };
      } else {
        this.websocketService.broadcast('notification', notificationData);
        return {
          success: true,
          message: 'Notification broadcasted to all clients',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to trigger notification: ${error.message}`,
      };
    }
  }
}
