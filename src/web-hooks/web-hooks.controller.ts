import { Body, Controller, Post, Headers, Req } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksPayload, WebHooksHeader } from './web-hooks.type';
import { RequestWithRawBody } from '../raw-body/raw-body.type';
@Controller('web-hooks')
export class UserController {
  constructor(private readonly webHooksService: WebHooksService) {}

  @Post('push')
  async push(
    @Body() pushData: WebHooksPayload,
    @Headers() header: WebHooksHeader,
    @Req() req: RequestWithRawBody,
  ) {
    const body = req.rawBody?.toString() || '';

    console.log('hader is ', header);
    console.log('body is', body);
    const status = await this.webHooksService.checkRequest(
      process.env.WEBHOOK_SECRET,
      header.signature,
      body,
    );
    console.log('check is ', status);
    return status;
  }
}
