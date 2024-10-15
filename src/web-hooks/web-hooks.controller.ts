import {
  Body,
  Controller,
  Post,
  Headers,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';
import { WebHooksPayload, WebHooksHeader } from './web-hooks.type';
import { Response } from 'express';
import { WebHooksTaskService } from 'src/web-hooks-task/web-hooks-task.service';
import { MailerService } from 'src/mailer/mailer.service';
@Controller('web-hooks')
export class UserController {
  constructor(
    private readonly webHooksService: WebHooksService,
    private readonly webHooksTaskService: WebHooksTaskService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('push')
  async push(
    @Body() pushData: WebHooksPayload,
    @Headers() header: WebHooksHeader,
  ) {
    console.time('push data');
    const token = header['x-hub-signature-256'] || '';
    const status = await this.webHooksService.checkRequest(
      process.env.WEBHOOK_SECRET,
      token,
      JSON.stringify(pushData),
    );
    console.log(token);

    if (!status) {
      console.log('check Authorization failed');
      return 'Not Authorization';
    }

    if (!pushData) {
      return {};
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

    this.webHooksTaskService.updateApp(config, pushData.after).then((res) => {
      const html = this.webHooksTaskService.buildMailerHtml({
        repository,
        result: res.result,
        status: res.status,
        branch,
        hash: pushData.after,
        commit: pushData.head_commit.message,
      });
      const subject = `${repository} 构建${res.status ? '成功' : '失败'}`;
      this.mailerService.sendMeil(subject, html);
    });
    console.log(`push id is ${id}`);
    console.timeEnd('push data');
    return {
      data: id,
    };
  }

  @Get('test')
  async test(@Query('s') s: string) {
    // const config = this.webHooksService.getRepositoryConfig(
    //   'teeu.cn',
    //   'master',
    // )!;
    // this.webHooksTaskService.updateApp(
    //   config,
    //   '2bf55d3debfb31aa0af204c64b7eb4a64a1a29e1',
    // );
    const status = s === '1';
    const html = this.webHooksTaskService.buildMailerHtml({
      repository: 'teeu.cn',
      result: status
        ? []
        : [
            {
              cmd: 'npm run build',
              output: ['error', 'error'],
            },
          ],
      status: status,
      branch: 'master',
      hash: '2bf55d3debfb31aa0af204c64b7eb4a64a1a29e1',
      commit: '2333',
    });
    console.log('run done');
    return html;
  }
}
