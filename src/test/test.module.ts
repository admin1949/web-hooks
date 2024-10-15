import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  controllers: [TestController],
  imports: [MailerModule],
})
export class TestModule {}
