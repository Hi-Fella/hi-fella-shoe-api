import { Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { WebsocketService } from './websocket.service';
import { AuthModule } from '@/modules/v1.0/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AppGateway, WebsocketService],
  exports: [AppGateway, WebsocketService],
})
export class WebsocketModule {}
