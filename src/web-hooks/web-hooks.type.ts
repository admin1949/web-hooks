export interface WebHooksPayload {
  ref: string;
  before: string;
  after: string;

  repository: {
    name: string;
  };

  pusher: {
    name: string;
    email: string;
  };

  commits: {
    id: string;
    message: string;
    timestamp: string;
  }[];

  head_commit: {
    id: string;
    message: string;
    timestamp: string;
  };
}

export interface WebHooksHeader {
  'x-hub-signature-256': string;
  'x-hub-signature': string;
}
