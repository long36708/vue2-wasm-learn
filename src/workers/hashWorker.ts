/**
 * @Author: longmo
 * @Date: 2024-12-29 15:01:31
 * @LastEditTime: 2024-12-29 15:01:41
 * @FilePath: src/workers/hashWorker.ts
 * @Description:
 */
import SparkMD5 from "spark-md5";

self.onmessage = (event) => {
  const fileChunkList = event.data.chunks;
  const spark = new SparkMD5.ArrayBuffer();
  let percentage = 0;
  let count = 0;
  const loadNext = (index: number) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(fileChunkList[index]);
    reader.onload = (e) => {
      count++;
      spark.append(e.target?.result as ArrayBuffer);
      if (count === fileChunkList.length) {
        self.postMessage({
          progress: 100,
          hash: spark.end(),
        });
        self.close();
      } else {
        percentage += 100 / fileChunkList.length;
        self.postMessage({
          progress: percentage,
        });
        // 递归计算下一个切片
        loadNext(count);
      }
    };
  };
  loadNext(0);
};
