import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { WebsocketService } from './websocket.service';

@Module({
  providers: [AppGateway, WebsocketService],
  exports: [AppGateway, WebsocketService],
})
export class WebsocketModule {}
