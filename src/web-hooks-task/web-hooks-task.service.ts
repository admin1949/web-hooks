import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import * as dayjs from 'dayjs';

interface Task<T = unknown> {
  (): T | Promise<T>;
}

@Injectable()
export class WebHooksTaskService {
  private tasks = new Map<string, { tasks: Task[]; current: Task | null }>();

  private async runTask(cwd: string) {
    const obj = this.tasks.get(cwd);
    if (!obj || obj.current) {
      return;
    }

    if (!obj.tasks.length) {
      this.tasks.delete(cwd);
      console.log(`cwd: ${cwd}\nall task run done`);
      return;
    }

    const current = obj.tasks.shift()!;
    obj.current = current;
    try {
      await current();
    } catch (err) {
      console.log(`task runing error\ncwd: ${cwd}\nerr:`, err);
    }

    obj.current = null;
    this.runTask(cwd);
  }

  private addTask(cwd: string, task: Task) {
    let obj = this.tasks.get(cwd);
    if (!obj) {
      obj = { tasks: [], current: null };
      this.tasks.set(cwd, obj);
    }
    obj.tasks.push(task);
    this.runTask(cwd);
  }

  private async runCommand(cmd: string | undefined, cwd: string) {
    if (!cmd) {
      return;
    }

    return new Promise<[status: boolean, output: string[]]>(
      (resolve, reject) => {
        const [command, ...args] = cmd
          .split(' ')
          .map((i) => i.trim())
          .filter(Boolean);
        if (!command) {
          return;
        }
        console.log(
          `${dayjs().format('YYYY-MM-DD HH:mm:ss')} start run task "${cmd}"`,
        );

        const child = spawn(command, args, {
          cwd,
        });
        const output: string[] = [];
        child
          .once('disconnect', reject)
          .once('error', reject)
          .on('exit', (code) => {
            console.log(
              `${dayjs().format('YYYY-MM-DD HH:mm:ss')} task "${cmd}" run done and code is ${code}`,
            );
            if (code === 0) {
              resolve([true, []]);
            } else {
              resolve([false, output]);
            }
          });

        child.stdout
          .on('data', (data: Buffer) => {
            const line = Buffer.from(data).toString();
            output.push(line);
            console.log(line);
          })
          .on('error', reject);
      },
    );
  }

  updateApp(config: { cwd: string; cmds: string[] }, hash: string) {
    const { cwd, cmds } = config;

    return new Promise<{
      status: boolean;
      result: {
        cmd: string;
        output: string[];
      }[];
    }>((resolve) => {
      const task = async () => {
        const allTask = [
          'git fetch',
          `git reset --hard ${hash}`,
          ...cmds,
        ].reverse();
        let status = true;
        const result: {
          cmd: string;
          output: string[];
        }[] = [];

        while (allTask.length) {
          const t = allTask.pop()!;
          const res = await this.runCommand(t, cwd);
          if (res && !res[0]) {
            status = false;
            result.push({
              cmd: t,
              output: res[1],
            });
          }
        }
        resolve({
          status,
          result,
        });
      };

      this.addTask(cwd, task);
    });
  }

  private readonly NodeList = {
    root: `<style>{{style}}</style><div class="result-page">
  {{status}}
  <div>{{repository}} / {{branch}}</div>
  <div>{{hash}}</div>
  <div>{{commit}}</div>
  <div>{{time}}</div>
  {{errorOutput}}
</div>`,
    success: `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1024 1024"
  class="icon success"
>
  <path
    fill="currentColor"
    d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"
  ></path>
</svg>
<div class="success">构建成功</div>`,
    error: `<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1024 1024"
  class="icon error"
>
  <path
    fill="currentColor"
    d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"
  ></path>
</svg>
<div class="error">构建失败</div>`,
    style: `.result-page {
  font-size: 16px;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.icon {
  width: 50px;
  height: 50px;
}
.success {
  color: #67c23a;
}
.error {
  color: #f56c6c;
}
.out-put-box {
  width: 100%;
  padding: 12px;
  background-color: #f2f1f1;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  font-family:
    Menlo,
    Consolas,
    Monaco,
    Liberation Mono,
    Lucida Console,
    monospace;
}
.out-put-box>div{
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.09);
}
.out-put-box>div:last-child{
  border-bottom: none; 
}
.code-number {
  display: inline-flex;
  width: 50px;
  justify-content: space-between;
  align-items: center;
}
.code-number > .number {
  color: #0085f2;
}`,
    outputBox: `<div class="out-put-box">
    {{code}}
</div>`,
    outputLine: `<div>
  <div class="code-number">
    <div>[</div>
    <div class="number">{{line}}</div>
    <div>]</div>
  </div>
  <span>{{msg}}</span>
</div>`,
  };

  buildMailerHtml(config: {
    repository: string;
    branch: string;
    hash: string;
    commit: string;
    status: boolean;
    result: {
      cmd: string;
      output: string[];
    }[];
  }) {
    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const status = config.status ? this.NodeList.success : this.NodeList.error;
    const errorOutput = config.status
      ? ''
      : this.buildOutputCode(config.result);

    return this.NodeList.root
      .replace('{{repository}}', config.repository)
      .replace('{{branch}}', config.branch)
      .replace('{{hash}}', config.hash)
      .replace('{{time}}', time)
      .replace('{{status}}', status)
      .replace('{{errorOutput}}', errorOutput)
      .replace('{{style}}', this.NodeList.style)
      .replace('{{commit}}', config.commit);
  }

  private buildOutputCode(result: { cmd: string; output: string[] }[]) {
    if (!result.length) {
      return '';
    }
    const nodes: string[] = [];
    const append = (msg: string) => {
      nodes.push(
        this.NodeList.outputLine
          .replace('{{line}}', (nodes.length + 1).toString())
          .replace('{{msg}}', msg),
      );
    };

    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      append(item.cmd);
      for (let j = 0; j < item.output.length; j++) {
        const line = item.output[j];
        if (!line.trim()) {
          continue;
        }
        append(line);
      }

      if (i < result.length - 2) {
        append('');
      }
    }
    const content = nodes.join('\n');

    return this.NodeList.outputBox.replace('{{code}}', content);
  }
}
