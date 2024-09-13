import { Body, Controller, Post } from '@nestjs/common';
import { WebHooksService } from './web-hooks.service';

@Controller('web-hooks')
export class UserController {
  constructor(private readonly userService: WebHooksService) {}

  @Post('push')
  push(@Body() pushData: any) {
    console.log('pushed data', JSON.stringify(pushData));
    // return this.userService.create(userData);
  }
}
