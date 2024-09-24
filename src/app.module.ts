import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebHooksService } from './web-hooks/web-hooks.service';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './web-hooks/web-hooks.controller';
import { ConfigModule } from '@nestjs/config';
import { projectsConfig } from './config/project';
import { WebHooksTaskService } from './web-hooks-task/web-hooks-task.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [projectsConfig],
    }),
  ],
  controllers: [AppController, UserController],
  providers: [AppService, WebHooksService, PrismaService, WebHooksTaskService],
})
export class AppModule {}
