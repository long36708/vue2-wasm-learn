/**
 * @Author: longmo
 * @Date: 2024-12-29 14:52:48
 * @LastEditTime: 2024-12-29 20:40:33
 * @FilePath: src/workers/md5worker.js
 * @Description:
 */
importScripts("https://rawgit.com/satazor/SparkMD5/master/spark-md5.min.js");

// const self = this;
self.addEventListener("message", (e) => {
  const file = e.data;
  const chunkSize = 128 * 1024; // 128KB
  //create fileReaderSync
  const totalParts = Math.ceil(file.size / chunkSize);
  const fileReaderSync = new FileReaderSync();
  const spark = new self.SparkMD5.ArrayBuffer();
  for (let i = 0; i < totalParts; i++) {
    const start = i * chunkSize;
    const end = Math.min(file.size, start + chunkSize);
    const buffer = fileReaderSync.readAsArrayBuffer(file.slice(start, end));

    spark.append(buffer);
  }
  const hash = spark.end();
  self.postMessage(hash);
});
