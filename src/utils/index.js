/**
 * @Author: longmo
 * @Date: 2024-12-28 21:13:26
 * @LastEditTime: 2024-12-28 21:13:41
 * @FilePath: src/utils/index.js
 * @Description:
 */
import packageJSON from "../package.json";

/**
 * 获取依赖版本
 * @param name
 * @returns {*|string}
 */
export function getVersion(name) {
  return packageJSON.dependencies[name] ?? "";
}
