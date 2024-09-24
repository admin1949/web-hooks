import { Test, TestingModule } from '@nestjs/testing';
import { WebHooksTaskService } from './web-hooks-task.service';

describe('WebHooksTaskService', () => {
  let service: WebHooksTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebHooksTaskService],
    }).compile();

    service = module.get<WebHooksTaskService>(WebHooksTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
