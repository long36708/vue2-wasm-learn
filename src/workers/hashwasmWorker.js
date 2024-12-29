/**
 * @Author: longmo
 * @Date: 2024-12-29 20:41:49
 * @LastEditTime: 2024-12-29 21:03:56
 * @FilePath: src/workers/hashwasmWorker.js
 * @Description:
 */

import { createMD5 } from "hash-wasm";
import pLimit from "p-limit";
import FileReaderTool from "../utils/FileReaderTool";

const calcFileHash = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 创建 MD5 实例
      const md5 = await createMD5();

      // 开始读取文件
      const arrayBuffer = await FileReaderTool.readAsArrayBuffer(file);
      if (arrayBuffer instanceof ArrayBuffer) {
        // 更新哈希对象的内容
        md5.update(new Uint8Array(arrayBuffer));

        // 获取最终的哈希值（十六进制格式）
        const hash = md5.digest("hex");
        console.log(`File ${file.name} hash-wasm MD5 Hash: ${hash}`);
        resolve(hash);
      }
      reject(new Error("Failed to compute MD5"));
    } catch (error) {
      console.error("Failed to compute MD5:", error);
      reject(new Error(`Failed to compute MD5,${error}`));
    }
  });
};
self.addEventListener("message", async (evt) => {
  console.log(evt);
  if (evt.data) {
    const files = evt.data;
    console.log(files);
    const fileList = Array.from(files);
    const results = [];
    // 这里一定要限制Promise.all的并发数量，否则浏览器会报错 RangeError: WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance
    // const promises = fileList.map((item) => calcFileHash(item));
    const limit = pLimit(10);
    const promises = fileList.map((item) => limit(() => calcFileHash(item)));
    results.push(...(await Promise.all(promises)));
    self.postMessage(results);
  }
});
