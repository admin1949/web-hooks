import { json } from 'body-parser';
import { RequestWithRawBody } from './raw-body.type';

export const RawBodyMiddleware = (): ReturnType<typeof json> => {
  return json({
    verify: (request, response, buffer) => {
      if (request.url?.startsWith('/web-hooks') && Buffer.isBuffer(buffer)) {
        (request as RequestWithRawBody).rawBody = Buffer.from(buffer);
      }
      return true;
    },
  });
};
