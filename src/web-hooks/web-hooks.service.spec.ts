import { Test, TestingModule } from '@nestjs/testing';
import { WebHooksService } from './web-hooks.service';

describe('UserService', () => {
  let service: WebHooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebHooksService],
    }).compile();

    service = module.get<WebHooksService>(WebHooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
