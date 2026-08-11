import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('./public/og-default.svg')
await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png()
  .toFile('./public/og-default.png')

console.log('OG image generated: public/og-default.png')
