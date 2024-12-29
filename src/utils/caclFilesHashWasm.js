/**
 * @Author: longmo
 * @Date: 2024-12-28 16:49:13
 * @LastEditTime: 2024-12-29 21:34:21
 * @FilePath: src/utils/caclFilesHashWasm.js
 * @Description:
 */
import { createMD5 } from "hash-wasm";
import pLimit from "p-limit";
import FileReaderTool from "./FileReaderTool";
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
export const calcFilesHashWasmConcurrent = async (files, count) => {
  return new Promise(async (resolve) => {
    try {
      const fileList = Array.from(files);
      if (!Array.isArray(fileList) || fileList.length === 0) {
        resolve([]);
      }
      // 创建一个限制器，最多允许同时运行10个任务
      const limit = pLimit(count);
      const promises = fileList.map((file) => limit(() => calcFileHash(file)));
      const results = await Promise.all(promises);
      resolve(results);
    } catch (error) {
      throw new Error(`计算 MD5 时出错: ${error.message}`, { cause: error });
    }
  });
};

export const calcFilesHashWasm10Concurrent = async (files) => {
  return new Promise(async (resolve) => {
    try {
      const fileList = Array.from(files);
      if (!Array.isArray(fileList) || fileList.length === 0) {
        resolve([]);
      }
      // 创建一个限制器，最多允许同时运行10个任务
      const limit = pLimit(10);
      const promises = fileList.map((file) => limit(() => calcFileHash(file)));
      const results = await Promise.all(promises);
      resolve(results);
    } catch (error) {
      throw new Error(`计算 MD5 时出错: ${error.message}`, { cause: error });
    }
  });
};

let md5Instance;

async function getOrCreateMD5() {
  if (!md5Instance) {
    md5Instance = await createMD5();
  } else {
    md5Instance.init();
  }
  return md5Instance;
}

const calcFileHashSingleMode = async (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      const md5 = await getOrCreateMD5();
      const arrayBuffer = await FileReaderTool.readAsArrayBuffer(file);
      if (arrayBuffer instanceof ArrayBuffer) {
        md5.update(new Uint8Array(arrayBuffer));
        const hash = md5.digest("hex");
        console.log(`File ${file.name} hash-wasm MD5 Hash: ${hash}`);
        resolve(hash);
      }
      reject(new Error("Failed to compute MD5"));
    } catch (error) {
      reject(new Error(`Failed to compute MD5,${error}`));
    }
  });
};

/**
 * @description: 单个文件计算MD5
 * @param files
 * @returns {Promise<unknown>}
 */
export const calcFilesHashWasmSingleMode = async (files) => {
  return new Promise(async (resolve) => {
    try {
      const fileList = Array.from(files);
      if (!Array.isArray(fileList) || fileList.length === 0) {
        resolve([]);
      }
      // const results = fileList.map(
      //   async (file) => await calcFileHashSingleMode(file)
      // );

      const results = [];
      for (const file of fileList) {
        const hash = await calcFileHashSingleMode(file);
        results.push(hash);
      }

      resolve(results);
    } catch (error) {
      throw new Error(`计算 MD5 时出错: ${error.message}`, { cause: error });
    }
  });
};

/**
 * @description: 批量计算文件MD5
 * @param files
 * @param batchSize
 * @returns {Promise<unknown>}
 */
export const calcFilesHashWasmBatch = async (files, batchSize = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileList = Array.from(files);
      if (!Array.isArray(fileList) || fileList.length === 0) {
        resolve([]);
      }

      const results = [];
      for (let i = 0; i < fileList.length; i += batchSize) {
        const batch = fileList.slice(i, i + batchSize);
        const promises = batch.map((file) => calcFileHash(file));
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // 可选：添加短暂延迟以减轻系统负担
        await new Promise((resolve) => setTimeout(resolve, 10)); // 例如等待10ms
      }

      resolve(results);
    } catch (error) {
      reject(new Error(`计算 MD5 时出错: ${error.message}`, { cause: error }));
    }
  });
};

// export const calcFilesHashWasm = async (files) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const fileList = Array.from(files);
//       if (!Array.isArray(fileList) || fileList.length === 0) {
//         resolve([]);
//       }
//       const results = [];
//       for (const file of fileList) {
//         const ab = await FileReaderTool.readAsArrayBuffer(file);
//         const hash = await wasmMD5(ab);
//         results.push(hash);
//       }
//       resolve(results);
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

export const calcFilesHashWasmByWorker = async (files) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 调用webworker计算文件MD5
      const worker = new Worker(
        new URL("@/workers/hashwasmWorker.js", import.meta.url),
        { type: "module" }
      );
      worker.postMessage(files);

      worker.onmessage = (e) => {
        console.log("webworker result", e.data);
        worker.terminate();
        resolve(e.data);
      };

      worker.onerror = (e) => {
        console.error("webworker error", e);
        worker.terminate();
        reject(e);
      };
    } catch (e) {
      reject(e);
    }
  });
};

export const calcFilesHashWasmByComlink = async (files) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileList = Array.from(files);
      if (!Array.isArray(fileList) || fileList.length === 0) {
        resolve([]);
      }
      const results = [];
      const worker = new Worker(
        new URL("@/workers/comlinkWorker.js", import.meta.url),
        { type: "module" }
      );
      // WebWorkers use `postMessage` and therefore work with Comlink.
      const comlink = Comlink.wrap(worker);
      const result = await comlink.calcFilesHash(fileList);
      console.log("result", result);
      resolve(results);
    } catch (e) {
      reject(e);
    }
  });
};
