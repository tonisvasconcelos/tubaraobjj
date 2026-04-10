import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const inputVideo = path.join(projectRoot, 'public', 'videos', 'background.mp4')
const outputVideo = path.join(projectRoot, 'public', 'videos', 'background-mobile.mp4')
const outputVideoLite = path.join(projectRoot, 'public', 'videos', 'background-mobile-lite.mp4')

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`ffmpeg exited with code ${code || 1}`))
    })
  })
}

async function main() {
  await runFfmpeg([
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
  ])
  console.log(`Generated mobile video: ${outputVideo}`)

  await runFfmpeg([
    '-y',
    '-i',
    inputVideo,
    '-vf',
    'scale=480:-2',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '36',
    '-maxrate',
    '420k',
    '-bufsize',
    '800k',
    '-movflags',
    '+faststart',
    '-an',
    outputVideoLite,
  ])
  console.log(`Generated lite mobile video: ${outputVideoLite}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
