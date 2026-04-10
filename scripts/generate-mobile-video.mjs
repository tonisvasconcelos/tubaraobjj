import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const inputVideo = path.join(projectRoot, 'public', 'videos', 'background.mp4')
const outputVideo = path.join(projectRoot, 'public', 'videos', 'background-mobile.mp4')

const args = [
  '-y',
  '-i',
  inputVideo,
  '-vf',
  'scale=720:-2',
  '-c:v',
  'libx264',
  '-preset',
  'veryfast',
  '-crf',
  '34',
  '-maxrate',
  '800k',
  '-bufsize',
  '1200k',
  '-movflags',
  '+faststart',
  '-an',
  outputVideo,
]

const child = spawn(ffmpegPath, args, { stdio: 'inherit' })

child.on('close', (code) => {
  if (code === 0) {
    console.log(`Generated mobile video: ${outputVideo}`)
    return
  }
  process.exitCode = code || 1
})
