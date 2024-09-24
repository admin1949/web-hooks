export interface ProjectsConfig {
  version: string;
  apps: {
    [repository: string]: {
      branchs: {
        [branch: string]: {
          cmds: string[];
        };
      };
      cwd: string;
    };
  };
}
