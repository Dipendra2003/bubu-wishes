import { spawnSync } from 'child_process';
process.env.DOTENVX_QUIET = '1';
spawnSync('node', ['./node_modules/tsx/dist/cli.mjs', 'watch', 'server.ts'], { stdio: 'inherit' });
