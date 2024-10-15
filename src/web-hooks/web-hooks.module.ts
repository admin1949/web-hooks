import { Module } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksTaskModule } from 'src/web-hooks-task/web-hooks-task.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [WebHooksService],
  imports: [WebHooksTaskModule, PrismaModule, ConfigModule],
  exports: [WebHooksService],
})
export class WebHooksModule {}
