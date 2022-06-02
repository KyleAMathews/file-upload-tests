# file-upload-tests
Testing the fastest way to upload files w/ Node.js on Linux

Testing against 60k files generated from the Markdown benchmark in the Gatsby monorepo.

## 01.js
Read files and count their bytes.

This is the most basic exercise — how long does it take to read
every byte and do some very minor work on it.

I tried setting concurrency between 2 & 200 without changing throughput.

- 132 MB / second
- 8840 files / second
