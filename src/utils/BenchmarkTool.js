/**
 * @Author: longmo
 * @Date: 2024-12-28 16:35:02
 * @LastEditTime: 2024-12-28 22:53:52
 * @FilePath: src/utils/BenchmarkTool.js
 * @Description:
 */
class BenchmarkTool {
  constructor(opt) {
    this.startTime = 0;
    this.endTime = 0;
    this.elapsedTime = 0;
    this.totalElapsedTime = 0;
    this.name = "";
    this.taskName = opt?.taskName ?? "";
    this.samples = [];
  }

  // 开始计时
  start(name = "default") {
    this.name = name;
    this.startTime = performance.now();
    console.log(`Benchmark started: ${name}`);
  }

  // 停止计时，并记录一次采样
  stop() {
    this.endTime = performance.now();
    this.elapsedTime = this.endTime - this.startTime;
    this.samples.push(this.elapsedTime);
    console.log(
      `Benchmark stopped: ${
        this.name
      }. Elapsed time: ${this.elapsedTime.toFixed(4)} ms`
    );
  }

  // 获取最近一次的执行时间
  getLastElapsedTime() {
    return this.samples.length ? this.samples[this.samples.length - 1] : null;
  }

  // 获取所有样本的平均执行时间
  getAverageElapsedTime() {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((acc, val) => acc + val, 0);
    return sum / this.samples.length;
  }

  getTotalElapsedTime() {
    return this.samples.reduce((acc, val) => acc + val, 0);
  }

  // 执行给定的函数并自动进行基准测试

  runSync(func, iterations = 1, ...args) {
    for (let i = 0; i < iterations; i++) {
      this.start(`${func.name} iteration ${i + 1}`);
      func(...args); // 执行传入的函数并传递参数
      this.stop();
    }
    console.log(
      `Average execution time over ${iterations} runs: ${this.getAverageElapsedTime().toFixed(
        4
      )} ms`
    );
    if (!this.name) {
      this.name = func.name;
    }
  }

  async runAsync(func, iterations = 1, ...args) {
    for (let i = 0; i < iterations; i++) {
      this.start(`${func.name} iteration ${i + 1}`);
      await func(...args); // 执行传入的函数并传递参数
      this.stop();
    }
    console.log(
      `Average execution time over ${iterations} runs: ${this.getAverageElapsedTime().toFixed(
        4
      )} ms`
    );
    if (!this.name) {
      debugger;
      this.name = func.name;
    }
  }

  // 清除所有样本数据
  clearSamples() {
    this.samples = [];
    this.name = "";
    console.log("Benchmark samples cleared.");
  }

  getResult() {
    // 操作次数
    const ops = this.samples.length;
    return {
      taskName: this.taskName,
      name: this.name,
      samples: this.samples,
      ops,
      averageElapsedTime: this.getAverageElapsedTime(),
      totalElapsedTime: this.getTotalElapsedTime(),
    };
  }
}

export default BenchmarkTool;
