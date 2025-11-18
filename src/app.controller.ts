import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpResponseUtil } from './common/utils/httpresponse.utils';
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
  getHello() {
    const message = this.appService.getHello();
    return HttpResponseUtil.success({
      message,
    });
  }

  @Post('test-email')
  async testEmail() {
    try {
      await this.emailService.sendResetPasswordEmail({
        to: 'rizqi@hi-fella.com',
        data: {
          link: 'https://hi-fella.com',
        },
      });
      return HttpResponseUtil.success({
        message: 'test email sent successfully',
      });
    } catch (error) {
      return HttpResponseUtil.serverError();
    }
  }

  // Socket.IO Examples

  @Post('broadcast')
  broadcastMessage(@Body() data: { message: string; event?: string }) {
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
      return HttpResponseUtil.serverError();
    }
  }

  @Post('send-to-room/:room')
  sendToRoom(
    @Param('room') room: string,
    @Body() data: { message: string; event?: string },
  ) {
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
      return HttpResponseUtil.serverError();
    }
  }

  @Get('websocket-stats')
  getWebsocketStats() {
    const clients = this.websocketService.getAllClients();

    return HttpResponseUtil.success({
      data: {
        connectedClients: this.websocketService.getClientsCount(),
        isServerInitialized: this.websocketService.isServerInitialized(),
        clients: clients.map((client) => ({
          id: client.id,
          rooms: client.rooms,
          connectedAt: client.connectedAt.toISOString(),
        })),
      },
    });
  }
}
