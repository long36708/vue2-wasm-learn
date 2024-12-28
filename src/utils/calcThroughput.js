/**
 * @Author: longmo
 * @Date: 2024-12-28 21:43:02
 * @LastEditTime: 2024-12-28 22:56:41
 * @FilePath: src/utils/calcThroughput.js
 * @Description:
 */

const bytes2Mb = (bytes) => {
  // 输入验证
  if (typeof bytes !== "number" || isNaN(bytes)) {
    throw new Error("Input must be a valid number");
  }

  // 处理边界条件
  if (bytes < 0) {
    throw new Error("Input cannot be negative");
  }

  // 确保数值在安全范围内
  if (!Number.isSafeInteger(bytes)) {
    console.warn("Input is a very large number, precision may be lost");
  }

  // 转换并返回结果
  return (bytes / 1024 / 1024).toFixed(2);
};

const ms2S = (ms) => {
  // 输入验证
  if (typeof ms !== "number" || isNaN(ms)) {
    throw new Error("Input must be a valid number");
  }

  // 处理负数情况（根据需求调整）
  if (ms < 0) {
    throw new Error("Negative input is not allowed");
  }

  // 转换并返回结果
  return (ms / 1000).toFixed(2);
};

/**
 * 计算吞吐量 单位：Mb/s
 * @param size
 * @param time
 * @returns {string}
 */

export const calcThroughput = (size, time) => {
  // 计算吞吐量并处理浮点数精度问题
  const throughput = bytes2Mb(size) / ms2S(time);
  return (Math.round(throughput * 100) / 100).toFixed(2);
};

/**
 * 计算文件总大小 单位：字节
 * @param files
 * @returns {unknown}
 */
export const calcTotalFileSize = (files) => {
  const fileList = Array.from(files);
  return fileList.reduce((acc, file) => acc + file.size, 0);
};

export const calcThroughputBy = (files, benchmark) => {
  const totalTime = benchmark.getTotalElapsedTime();
  const totalFileSizeOnce = calcTotalFileSize(files);
  const cycleCount = benchmark.samples.length;
  const totalFileSize = totalFileSizeOnce * cycleCount;
  return {
    throughput: calcThroughput(totalFileSize, totalTime),
    totalFileSize: bytes2Mb(totalFileSize),
  };
};
