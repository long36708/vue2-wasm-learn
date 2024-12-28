/**
 * @Author: longmo
 * @Date: 2024-12-28 16:49:13
 * @LastEditTime: 2024-12-28 19:30:20
 * @FilePath: src/utils/caclFilesHashWasm.js
 * @Description:
 */
import { createMD5 } from "hash-wasm";
import pLimit from "p-limit";

const calcFileHash = async (file) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      // 创建 MD5 实例
      const md5 = await createMD5();

      // 使用 FileReader 读取文件为 ArrayBuffer
      const reader = new FileReader();
      reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          // 更新哈希对象的内容
          md5.update(new Uint8Array(arrayBuffer));

          // 获取最终的哈希值（十六进制格式）
          const hash = md5.digest("hex");
          console.log(`File ${file.name} hash-wasm MD5 Hash: ${hash}`);
          resolve(hash);
        }
      };

      // 开始读取文件
      reader.readAsArrayBuffer(file);
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
      const reader = new FileReader();
      reader.onload = async function (e) {
        const arrayBuffer = e.target.result;
        if (arrayBuffer instanceof ArrayBuffer) {
          md5.update(new Uint8Array(arrayBuffer));
          const hash = md5.digest("hex");
          console.log(`File ${file.name} hash-wasm MD5 Hash: ${hash}`);
          resolve(hash);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(new Error(`Failed to compute MD5,${error}`));
    }
  });
};
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
