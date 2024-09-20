import { Body, Controller, Post, Headers, Req } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksPayload, WebHooksHeader } from './web-hooks.type';
import type { Request } from 'express';

@Controller('web-hooks')
export class UserController {
  constructor(private readonly webHooksService: WebHooksService) {}

  @Post('push')
  async push(
    @Body() pushData: WebHooksPayload,
    @Headers() header: WebHooksHeader,
    @Req() req: Request,
  ) {
    console.log('pushed data', JSON.stringify(pushData));
    console.log(req);
    const body = JSON.stringify(pushData);
    const status = await this.webHooksService.checkRequest(
      process.env.WEBHOOK_SECRET,
      header['x-hub-signature-256'],
      body,
    );
    console.log(status);
    return status;
  }
}
