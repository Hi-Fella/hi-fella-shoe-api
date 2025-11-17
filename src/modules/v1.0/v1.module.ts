import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,  // handles /v1.0/auth routes
    UserModule, // handles /v1.0/user routes
  ],
  controllers: [], // usually leave empty here, controllers are inside submodules
  providers: [],   // same for providers
  exports: [],     // optional, export modules if needed by other modules
})
export class V1Module {}