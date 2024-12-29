/**
 * @Author: longmo
 * @Date: 2024-12-29 23:43:41
 * @LastEditTime: 2024-12-29 23:44:24
 * @FilePath: src/workers/workerMessage.ts
 * @Description:
 */
// WorkerMessage.ts
import type { WorkerLabelsEnum } from "@/types/workerLabels.enum";

export class WorkerMessage<T = any> {
  label: WorkerLabelsEnum;
  content?: T;

  constructor(label: WorkerLabelsEnum, content?: T) {
    this.label = label;
    this.content = content;
  }
}

export interface WorkerRep<T = any> {
  data: WorkerMessage<T>;
}
