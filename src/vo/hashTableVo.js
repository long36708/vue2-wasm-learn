/**
 * @Author: longmo
 * @Date: 2024-12-28 17:31:24
 * @LastEditTime: 2024-12-28 17:34:36
 * @FilePath: src/vo/hashTableVo.js
 * @Description:
 */
export class HashTableVo {
  constructor(opt) {
    this.name = opt?.name ?? "";
    this.averageElapsedTime = opt?.time ?? 0; // 平均耗时
    this.speed = opt?.speed ?? 0;
  }
}
