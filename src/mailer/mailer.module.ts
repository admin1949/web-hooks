import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [MailerService],
  imports: [ConfigModule],
  exports: [MailerService],
})
export class MailerModule {}
