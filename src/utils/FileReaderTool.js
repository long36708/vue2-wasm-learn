/**
 * @Author: longmo
 * @Date: 2024-12-29 00:27:54
 * @LastEditTime: 2024-12-29 17:48:56
 * @FilePath: src/utils/FileReaderTool.js
 * @Description:
 */
class FileReaderTool {
  constructor() {
    //
  }

  /**
   * 创建一个带有进度回调的文件读取器
   * @param {File} file - 要读取的文件对象
   * @param {Function} onProgress - 进度事件回调函数
   * @returns {{readAsText: Function, readAsDataURL: Function, readAsArrayBuffer: Function}}
   */
  static createProgressiveReader(file, onProgress) {
    const reader = new FileReader();
    if (onProgress && typeof onProgress === "function") {
      reader.onprogress = onProgress;
    }

    return {
      readAsText: () =>
        FileReaderTool._readWithPromise(reader.readAsText, reader, file),
      readAsDataURL: () =>
        FileReaderTool._readWithPromise(reader.readAsDataURL, reader, file),
      readAsArrayBuffer: () =>
        FileReaderTool._readWithPromise(reader.readAsArrayBuffer, reader, file),
      abort: () => reader.abort(), // 添加取消读取功能
    };
  }

  /**
   * 内部方法：创建带进度回调的 Promise 包装
   * @param {Function} readMethod - FileReader 的读取方法
   * @param {FileReader} reader - FileReader 实例
   * @param {File} file - 文件对象
   * @returns {Promise<any>}
   */
  static _readWithPromise(readMethod, reader, file) {
    return new Promise((resolve, reject) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      readMethod.call(reader, file);
    });
  }

  /**
   * 批量处理文件并返回所有结果
   * @param {File[]} files - 文件数组
   * @param {string} method - 读取方法 ('readAsText', 'readAsDataURL', 'readAsArrayBuffer')
   * @param {Function} [onProgress] - 单个文件的进度回调
   * @returns {Promise<Array<any>>}
   */
  static batchRead(files, method, onProgress) {
    const readers = files.map((file) =>
      FileReaderTool.createProgressiveReader(file, onProgress)
    );

    switch (method) {
      case "readAsText":
        return Promise.all(readers.map((reader) => reader.readAsText()));
      case "readAsDataURL":
        return Promise.all(readers.map((reader) => reader.readAsDataURL()));
      case "readAsArrayBuffer":
        return Promise.all(readers.map((reader) => reader.readAsArrayBuffer()));
      default:
        throw new Error("Invalid read method specified");
    }
  }

  /**
   * 检查文件类型是否符合预期
   * @param {File | Blob } file - 文件对象
   * @param {string|string[]} types - 预期的 MIME 类型或类型数组
   * @returns {boolean}
   */
  static checkFileType(file, types) {
    if (!types || !file.type) return true;
    if (typeof types === "string") {
      return file.type === types;
    } else if (Array.isArray(types)) {
      return types.includes(file.type);
    }
    return false;
  }

  /**
   * 读取文件为文本
   * @param {File } file - 要读取的文件对象
   * @returns {Promise<string>} 解析为文件内容字符串的 Promise
   */
  static readAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  /**
   * 读取文件为数据 URL
   * @param {File} file - 要读取的文件对象
   * @returns {Promise<string>} 解析为数据 URL 的 Promise
   */
  static readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * 读取文件为 ArrayBuffer
   * @param {File } file - 要读取的文件对象
   * @returns {Promise<ArrayBuffer>} 解析为 ArrayBuffer 的 Promise
   */
  static readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 将 Blob 转换为 Base64
   * @param blob
   * @returns {Promise<unknown>}
   */
  static blobToBase64(blob) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 将 Blob 转换为 ArrayBuffer
   * @param blob
   * @returns {Promise<unknown>}
   */
  static blobToArrayBuffer(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * 将 Base64 转换为 Blob
   * @param base64Data
   * @param contentType
   * @param sliceSize
   * @returns {Blob}
   */
  static base64toBlob(
    base64Data,
    contentType = "application/octet-stream",
    sliceSize = 512
  ) {
    // 输入验证
    if (typeof base64Data !== "string") {
      throw new Error("base64Data must be a string");
    }
    if (typeof contentType !== "string") {
      throw new Error("contentType must be a string");
    }
    if (!Number.isInteger(sliceSize) || sliceSize <= 0) {
      throw new Error("sliceSize must be a positive integer");
    }

    try {
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (
        let offset = 0;
        offset < byteCharacters.length;
        offset += sliceSize
      ) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteArray = new Uint8Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
          byteArray[i] = slice.charCodeAt(i);
        }

        byteArrays.push(byteArray);
      }

      return new Blob(byteArrays, { type: contentType });
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "InvalidCharacterError"
      ) {
        throw new Error("Invalid Base64 string");
      } else {
        throw error;
      }
    }
  }

  /**
   * 将 Base64 字符串转换为 Blob
   * @param base64Str
   * @returns {Blob}
   */
  static getBase64ToBlob(base64Str) {
    try {
      // 验证 base64Str 是否符合预期格式
      if (!base64Str.startsWith("data:")) {
        throw new Error("Invalid base64 string format");
      }

      const [header, data] = base64Str.split(",", 2);
      if (data === undefined) {
        throw new Error("Invalid base64 string format");
      }

      const mimeString = header.split(":")[1].split(";")[0];
      let byteString;

      if (header.includes("base64")) {
        byteString = atob(data);
      } else {
        byteString = decodeURIComponent(escape(data));
      }

      // 使用 TextEncoder 提高性能
      const encoder = new TextEncoder();
      const uint8Array = encoder.encode(byteString);

      return new Blob([uint8Array], { type: mimeString });
    } catch (error) {
      console.error("Error converting base64 to blob:", error.message);
      throw error; // 重新抛出异常以便调用者处理
    }
  }

  /**
   * 将 Blob 转换为 Object URL
   * @param blob
   * @returns {string}
   */
  static blob2ObjectUrl(blob) {
    return URL.createObjectURL(blob);
  }

  /**
   * 将 ArrayBuffer 转换为 Blob
   * @param buffer
   * @param byteOffset
   * @param length
   * @param contentType
   * @returns {Blob}
   */
  static arrayBuffer2Blob(
    buffer,
    byteOffset = 0,
    length = buffer?.byteLength || 0,
    contentType = "application/octet-stream" // 通用的 MIME 类型，用于表示未指定格式的二进制数据
  ) {
    // 参数验证
    if (!buffer || !(buffer instanceof ArrayBuffer)) {
      throw new TypeError("The first argument must be an ArrayBuffer.");
    }

    if (
      typeof byteOffset !== "number" ||
      byteOffset < 0 ||
      byteOffset > buffer.byteLength
    ) {
      throw new RangeError(
        "byteOffset must be a non-negative integer and less than buffer.byteLength."
      );
    }

    if (
      typeof length !== "number" ||
      length < 0 ||
      byteOffset + length > buffer.byteLength
    ) {
      throw new RangeError(
        "length must be a non-negative integer and within the bounds of the buffer."
      );
    }

    return new Blob([new Uint8Array(buffer, byteOffset, length)], {
      type: contentType,
    });
  }

  /**
   * 将 Base64 转换为 File
   * @param base64Str
   * @param fileName
   * @returns {File}
   */
  static base64ToFile(base64Str, fileName) {
    try {
      // 检查 base64Str 是否为空或不符合预期格式
      if (!base64Str || !base64Str.includes(",")) {
        throw new Error("Invalid base64 string format");
      }

      const arr = base64Str.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        throw new Error("Invalid MIME type format");
      }
      const mime = mimeMatch[1];

      let bstr;
      try {
        bstr = atob(arr[1]);
      } catch (e) {
        throw new Error("Invalid Base64 string");
      }

      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }

      return new File([u8arr], fileName, { type: mime });
    } catch (error) {
      console.error("Error converting base64 to file:", error.message);
      throw error; // 重新抛出错误以便调用者处理
    }
  }
}

export default FileReaderTool;
