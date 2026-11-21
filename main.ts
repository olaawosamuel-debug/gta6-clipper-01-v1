// gta6-clipper-01 entrypoint (Node 22, standard library only).
//
// The entry itself is the YouTube video: a 30-second vertical fan edit of
// official GTA VI Trailer 2 footage, cut and rendered with ffmpeg in the
// session that built this repository, carrying the make.fun pitch as
// on-screen text. This program does nothing creative and nothing is scored
// from what it writes: it hands the video's address to the gate by copying
// VIDEO.json from the repository root into the output directory, where the
// house reads the video through the YouTube Data API.
//
// Run it locally the way the grader runs it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(botDir, 'VIDEO.json');
const targetPath = join(outputDir, 'VIDEO.json');

let raw;
try {
  raw = readFileSync(sourcePath, 'utf8').trim();
} catch (err) {
  console.error(`VIDEO.json could not be read from ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

let video;
try {
  video = JSON.parse(raw);
} catch (err) {
  console.error(`VIDEO.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof video !== 'object' || video === null || typeof video.url !== 'string') {
  console.error('VIDEO.json must be a JSON object with a string "url" field.');
  process.exit(1);
}

// The gate only accepts a YouTube address. During the build the placeholder
// stands in for the not-yet-uploaded video; anything else is a mistake in
// VIDEO.json and should fail loudly here rather than at the gate.
const isPlaceholder = video.url === 'https://www.youtube.com/shorts/PLACEHOLDER';
const isYouTube = /^https:\/\/(www\.|m\.)?(youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)[A-Za-z0-9_-]{11}/.test(video.url);
if (!isPlaceholder && !isYouTube) {
  console.error(`VIDEO.json url does not look like a YouTube video address: ${video.url}`);
  process.exit(1);
}
if (isPlaceholder) {
  console.warn('VIDEO.json still holds the PLACEHOLDER address; replace it with the uploaded video before submitting.');
}

mkdirSync(outputDir, { recursive: true });
writeFileSync(targetPath, `${JSON.stringify(video)}\n`, 'utf8');
console.log(`Wrote ${targetPath} for ${video.url}`);
