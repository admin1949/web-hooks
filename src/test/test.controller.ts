import { Controller, Get } from '@nestjs/common';
import { MailerService } from 'src/mailer/mailer.service';

@Controller('test')
export class TestController {
  constructor(private readonly mailerService: MailerService) {}
  @Get()
  async test() {
    const status = await this.mailerService.sendMeil(
      'test',
      '<h1>test only</h1>',
    );
    return {
      data: status,
      code: 200,
      message: status ? '操作成功' : '操作失败',
    };
  }
}
