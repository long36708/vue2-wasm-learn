/**
 * @Author: longmo
 * @Date: 2024-12-29 21:27:15
 * @LastEditTime: 2024-12-29 21:40:39
 * @FilePath: src/workers/comlinkWorker.js
 * @Description:
 */
import { createMD5 } from "hash-wasm";
import FileReaderTool from "../utils/FileReaderTool";
import * as Comlink from "comlink";

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
const obj = {
  async calcFilesHash(fileList, batchSize = 10) {
    const results = [];

    // RangeError: WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance
    // for (const file of fileList) {
    //   const hash = await calcFileHash(file);
    //   results.push(hash);
    // }

    for (let i = 0; i < fileList.length; i += batchSize) {
      const batch = fileList.slice(i, i + batchSize);
      const promises = batch.map((file) => calcFileHash(file));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);

      // 可选：添加短暂延迟以减轻系统负担
      // await new Promise((resolve) => setTimeout(resolve, 10)); // 例如等待10ms
    }
    return results;
  },
};

Comlink.expose(obj);
