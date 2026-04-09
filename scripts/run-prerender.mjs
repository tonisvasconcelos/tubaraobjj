import { spawnSync } from 'node:child_process'

const isVercel = process.env.VERCEL === '1'
const skipPrerender = process.env.SKIP_PRERENDER === '1'

if (isVercel || skipPrerender) {
  console.log('Skipping react-snap prerender in this environment.')
  process.exit(0)
}

const result = spawnSync('npx', ['react-snap'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
