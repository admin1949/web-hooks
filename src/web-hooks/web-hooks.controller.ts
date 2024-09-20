import { Body, Controller, Post, Headers, Res } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksPayload, WebHooksHeader } from './web-hooks.type';
import { Response } from 'express';
@Controller('web-hooks')
export class UserController {
  constructor(private readonly webHooksService: WebHooksService) {}

  @Post('push')
  async push(
    @Body() pushData: WebHooksPayload,
    @Headers() header: WebHooksHeader,
    @Res() res: Response,
  ) {
    const status = await this.webHooksService.checkRequest(
      process.env.WEBHOOK_SECRET,
      header['x-hub-signature-256'] || '',
      JSON.stringify(pushData),
    );

    if (!status) {
      console.log('check Authorization failed');
      res.status(401);
      return 'Not Authorization';
    }

    if (!pushData) {
      return;
    }

    const repository = pushData.repository.name;
    const { id } = await this.webHooksService.create({
      repository,
      hash: pushData.after,
      beforeHash: pushData.before,
      commit: pushData.head_commit.message,
      commitTime: new Date(pushData.head_commit.timestamp),
      author: pushData.pusher.name,
      email: pushData.pusher.email,
    });

    console.log(`push id is ${id}`);
    return;
  }
}
