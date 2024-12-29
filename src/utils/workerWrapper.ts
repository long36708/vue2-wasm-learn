/**
 * @Author: longmo
 * @Date: 2024-12-29 23:43:04
 * @LastEditTime: 2024-12-29 23:45:12
 * @FilePath: src/workers/workerWrapper.ts
 * @Description:
 */
import type { WorkerRep } from "./workerMessage";
import { WorkerLabelsEnum } from "@/types/workerLabels.enum";

export enum StatusEnum {
  RUNNING = "running",
  WAITING = "waiting",
}

export class WorkerWrapper {
  worker: Worker;
  status: StatusEnum;

  constructor(worker: Worker) {
    this.worker = worker;
    this.status = StatusEnum.WAITING;
  }

  run<T>(param: ArrayBuffer, params: ArrayBuffer[], index: number) {
    this.status = StatusEnum.RUNNING;
    return new Promise<T>((rs, rj) => {
      this.worker.onmessage = ({
        data,
      }: WorkerRep<{ result: string; chunk: ArrayBuffer }>) => {
        const { label, content } = data;
        if (label === WorkerLabelsEnum.DONE && content) {
          params[index] = content.chunk; // 归还分片的所有权
          this.status = StatusEnum.WAITING;
          rs(content.result as unknown as T);
        }
      };
      this.worker.onerror = (e) => {
        this.status = StatusEnum.WAITING;
        rj(e);
      };
      this.worker.postMessage(param, [param]); // 用于 transfer 的数据, 以避免结构化克隆
    });
  }
}
