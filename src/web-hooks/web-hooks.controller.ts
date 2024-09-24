import { Body, Controller, Post, Headers, Res } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksPayload, WebHooksHeader } from './web-hooks.type';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { WebHooksTaskService } from 'src/web-hooks-task/web-hooks-task.service';
@Controller('web-hooks')
export class UserController {
  constructor(
    private readonly webHooksService: WebHooksService,
    private readonly configServices: ConfigService,
    private readonly webHooksTaskService: WebHooksTaskService,
  ) {}

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
    const branch = pushData.ref.slice(pushData.ref.lastIndexOf('/') + 1);

    const config = this.webHooksService.getRepositoryConfig(repository, branch);
    if (!config) {
      return;
    }

    const { id } = await this.webHooksService.create({
      repository,
      hash: pushData.after,
      beforeHash: pushData.before,
      commit: pushData.head_commit.message,
      commitTime: new Date(pushData.head_commit.timestamp),
      author: pushData.pusher.name,
      email: pushData.pusher.email,
    });

    this.webHooksTaskService.updateApp(config, pushData.after);
    console.log(`push id is ${id}`);
    return;
  }

  @Post('test')
  async test() {
    return 1;
  }
}
