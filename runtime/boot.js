import fs from 'fs';
import path from 'path';

export function bootRuntime() {
  const now = new Date().toISOString();
  const cwd = process.cwd();
  const runtimeState = {
    status: 'ACTIVE',
    booted_at: now,
    cwd,
  };

  return runtimeState;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const state = bootRuntime();
  console.log('[AXIUM:RUNTIME:BOOT]', JSON.stringify(state, null, 2));
}
