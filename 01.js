const fs = require(`fs`)
const path = require(`path`)
const fastq = require(`fastq`)
const glob = require(`glob`)
const prettyBytes = require(`pretty-bytes`)

let totalBytes = 0

function reader(file, cb) {
  // Count bytes
  const readStream = fs.createReadStream(file)
  readStream.on(`data`, (chunk) => {
    totalBytes += chunk.length
  })
  readStream.on(`end`, () => {
    cb()
  })
}

const readerQueue = fastq(reader, { concurrency: 2 })

const PUBLIC_DIR = process.env.PUBLIC_DIR

async function main() {
  console.time(`glob`)
  let files = []
  const filesCachePath = path.join(PUBLIC_DIR, `../files-cache.txt`)
  if (fs.existsSync(filesCachePath)) {
    files = JSON.parse(fs.readFileSync(filesCachePath))
  } else {
    files = await new Promise((resolve) =>
      glob(`${PUBLIC_DIR}/**/*`, { nodir: true }, (_err, matches) =>
        resolve(matches)
      )
    )
    fs.writeFileSync(filesCachePath, JSON.stringify(files))
  }
  console.timeEnd(`glob`)

  console.log(`total files`, files.length)

  const start = new Date().getTime()
  console.time(`read files`)
  files.forEach((file) => readerQueue.push(file, () => {}))

  if (!readerQueue.idle()) {
    await new Promise((resolve) => (readerQueue.drain = resolve))
  }
  console.timeEnd(`read files`)
  const end = new Date().getTime()
  const total = end - start
  const bytesPerSecond = totalBytes / (total / 1000)
  const filesPerSecond = files.length / (total / 1000)
  console.log({ bytesPerSecond: prettyBytes(bytesPerSecond), filesPerSecond })
}

main()
