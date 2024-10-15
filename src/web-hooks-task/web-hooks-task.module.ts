import { Module } from '@nestjs/common';
import { WebHooksTaskService } from './web-hooks-task.service';

@Module({
  providers: [WebHooksTaskService],
  exports: [WebHooksTaskService],
})
export class WebHooksTaskModule {}
