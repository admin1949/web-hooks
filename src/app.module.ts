import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebHooksService } from './web-hooks/web-hooks.service';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './web-hooks/web-hooks.controller';

@Module({
  imports: [],
  controllers: [AppController, UserController],
  providers: [AppService, WebHooksService, PrismaService],
})
export class AppModule {}
