import { Injectable } from '@nestjs/common';
import { spawn } from 'node:child_process';
import dayjs from 'dayjs';

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
    return new Promise<boolean>((resolve, reject) => {
      const [command, ...args] = cmd.split(' ').map((i) => i.trim());

      const child = spawn(command, args, {
        cwd,
      });
      child
        .once('disconnect', reject)
        .once('error', reject)
        .on('exit', (code) => {
          console.log(`task "${cmd}" run done and code is ${code}`);
          if (code === 0) {
            resolve(true);
          } else {
            reject();
          }
        });

      child.stdout
        .on('data', (data) => {
          console.log(dayjs().format('YYYY-MM-DD HH:mm:ss'), data);
        })
        .on('error', reject);
    });
  }

  updateApp(config: { cwd: string; cmds: string[] }, hash: string) {
    const { cwd, cmds } = config;

    const task = async () => {
      const allTask = [
        'git fetch',
        `git reset HEAD ${hash}`,
        ...cmds,
      ].reverse();

      while (allTask.length) {
        const t = allTask.pop();
        await this.runCommand(t, cwd);
      }
    };

    this.addTask(cwd, task);
  }
}
