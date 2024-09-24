import { registerAs } from '@nestjs/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export const projectsConfig = registerAs('projects', () => {
  let obj = {};
  try {
    const p = resolve(process.cwd(), 'env.json');
    const file = readFileSync(p, 'utf-8').toString();
    obj = JSON.parse(file);
  } catch (err) {
    console.log('read file err', err);
  }

  return obj;
});
