import SparkMD5 from "spark-md5";

/**
 * 计算多个文件的 SparkMD5 哈希值
 * 不分块计算
 * @param e
 * @returns {Promise<void>}
 *
 */
export const calcFilesSparkMd5 = async (files) => {
  // 验证事件对象
  if (!files) {
    console.warn("Invalid event object or no files found");
    return;
  }

  // 处理空文件列表
  if (files.length === 0) {
    console.warn("No files selected");
    return;
  }

  const fileList = Array.from(files);
  const promises = fileList.map((file) => calcFileSparkMd5(file));

  try {
    const results = await Promise.all(promises);
    // 改进日志输出
    if (process.env.NODE_ENV !== "production") {
      console.log("spark-md5 calculation results:", results);
    }
    return results;
  } catch (error) {
    console.error("Error calculating MD5 for files:", error);
  }
};

export const calcFileSparkMd5 = (file) => {
  return new Promise((resolve, reject) => {
    // 校验 file 参数是否为有效的文件对象
    if (!file || !(file instanceof File)) {
      reject(new Error("无效的文件对象"));
      return;
    }

    try {
      const reader = new FileReader();
      const spark = new SparkMD5.ArrayBuffer();

      // 当文件读取完成时触发
      reader.onload = function (e) {
        try {
          spark.append(e.target.result); // 将文件内容追加到 SparkMD5 实例中
          const hash = spark.end(); // 计算最终的 MD5 哈希值
          console.log(`文件 ${file.name} 的 MD5 哈希值为: ${hash}`);
          resolve(hash);
        } catch (error) {
          console.error("计算 MD5 时出错", error);
          reject(new Error("计算 MD5 时出错"));
        } finally {
          spark.destroy(); // 释放 SparkMD5 资源
        }
      };

      // 如果在读取过程中出现错误，则触发
      reader.onerror = function () {
        console.error("读取文件时出错");
        reject(new Error("读取文件时出错"));
      };

      // 开始读取文件为 ArrayBuffer
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("初始化 FileReader 或 SparkMD5 失败", error);
      reject(new Error("初始化 FileReader 或 SparkMD5 失败"));
    }
  });
};
