import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebHooksService } from './web-hooks/web-hooks.service';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './web-hooks/web-hooks.controller';
import { ConfigModule } from '@nestjs/config';
import { projectsConfig } from './config/project';
import { WebHooksTaskService } from './web-hooks-task/web-hooks-task.service';
import { MailerService } from './mailer/mailer.service';
import { MailerModule } from './mailer/mailer.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebHooksModule } from './web-hooks/web-hooks.module';
import { WebHooksTaskModule } from './web-hooks-task/web-hooks-task.module';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [projectsConfig],
    }),
    MailerModule,
    PrismaModule,
    WebHooksModule,
    WebHooksTaskModule,
    TestModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    PrismaService,
    WebHooksTaskService,
    WebHooksService,
    MailerService,
  ],
})
export class AppModule {}
