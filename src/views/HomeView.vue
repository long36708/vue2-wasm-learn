<script setup>
import { ref } from "vue";
import XEUtils from "xe-utils";
import BenchmarkTool from "@/utils/BenchmarkTool";
import { calcFilesSparkMd5 } from "@/utils/calcFilesSparkMd5";
import {
  calcFilesHashWasm10Concurrent,
  calcFilesHashWasmBatch,
  calcFilesHashWasmConcurrent,
  calcFilesHashWasmSingleMode,
} from "@/utils/caclFilesHashWasm";
import { calcThroughputBy } from "@/utils/calcThroughput";

const imgFileList = ref([]);

const hashResult = ref([]);

// 迭代次数
const ITERATIONS = 3;
/**
 * 计算单个文件的 SparkMD5 哈希值
 * 不分块计算
 * @returns {Promise<unknown>}
 * @param e
 */
const handleFileChange = async (e) => {
  console.log(e.target?.files);
  const { files } = e.target;
  if (!files) {
    return;
  }
  imgFileList.value = files;
};

const handleCalcHashSparkMd5 = async () => {
  // sparkMd5Value.value = await calcFileSparkMd5(files[0]);
  // sparkMd5Value.value = await calcFilesSparkMd5(e); // 计算多个文件的 SparkMD5 哈希值
  const benchmark = new BenchmarkTool({
    taskName: "HashSparkMd5",
  });
  // 运行基准测试
  await benchmark.runAsync(calcFilesSparkMd5, ITERATIONS, imgFileList.value); // 执行 exampleFunction 5 次

  // 获取平均执行时间
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  const throughput = calcThroughputBy(imgFileList.value, benchmark);
  hashResult.value = [
    ...hashResult.value,
    {
      ...throughput,
      ...benchmark.getResult(),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasm4Concurrent = async () => {
  const count = 4;
  const benchmark = new BenchmarkTool({
    taskName: `HashWasm ${count}个并发`,
  });
  // 运行基准测试
  await benchmark.runAsync(
    calcFilesHashWasmConcurrent,
    ITERATIONS,
    imgFileList.value,
    count
  ); // 执行 exampleFunction 5 次

  // 获取平均执行时间
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  const throughput = calcThroughputBy(imgFileList.value, benchmark);
  hashResult.value = [
    ...hashResult.value,
    {
      ...throughput,
      ...benchmark.getResult(),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasm10Concurrent = async () => {
  const benchmark = new BenchmarkTool({ taskName: "HashWasm 10个并发" });
  // 运行基准测试
  await benchmark.runAsync(
    calcFilesHashWasm10Concurrent,
    ITERATIONS,
    imgFileList.value
  ); // 执行 exampleFunction 5 次

  // 获取平均执行时间
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  const throughput = calcThroughputBy(imgFileList.value, benchmark);
  hashResult.value = [
    ...hashResult.value,
    {
      ...throughput,
      ...benchmark.getResult(),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasmSingleMode = async () => {
  const benchmark = new BenchmarkTool({
    taskName: "HashWasm 单个模式",
  });
  await benchmark.runAsync(
    calcFilesHashWasmSingleMode,
    ITERATIONS,
    imgFileList.value
  );
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  const throughput = calcThroughputBy(imgFileList.value, benchmark);
  hashResult.value = [
    ...hashResult.value,
    {
      ...throughput,
      ...benchmark.getResult(),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcFilesHashWasmBatch = async () => {
  const benchmark = new BenchmarkTool({
    taskName: "HashWasm Batch",
  });
  await benchmark.runAsync(
    calcFilesHashWasmBatch,
    ITERATIONS,
    imgFileList.value
  );
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );
  const throughput = calcThroughputBy(imgFileList.value, benchmark);
  hashResult.value = [
    ...hashResult.value,
    {
      ...throughput,
      ...benchmark.getResult(),
    },
  ];
  benchmark.clearSamples();
};

const gridOptions = ref({
  border: true,
  columns: [
    { field: "taskName", title: "任务名称" },
    { field: "ops", title: "执行次数" },
    {
      field: "totalElapsedTime",
      title: "总耗时(ms)",
      formatter({ cellValue }) {
        return XEUtils.commafy(Number(cellValue), { digits: 2 });
      },
    },
    { field: "totalFileSize", title: "总大小(MB)" },
    {
      field: "averageElapsedTime",
      title: "平均耗时(ms)",
      formatter({ cellValue }) {
        return XEUtils.commafy(Number(cellValue), { digits: 2 });
      },
    },
    { field: "throughput", title: "吞吐量(MB/s)" },
  ],
  data: [],
});

const handleSumTable = () => {
  gridOptions.value.data = hashResult.value;
};
</script>

<template>
  <main>
    <div>Home</div>

    <div>
      <input type="file" multiple accept="image/*" @change="handleFileChange" />
    </div>

    <div>
      当前文件数量：
      <span>{{ imgFileList.length }}</span>
    </div>

    <div>
      <button @click="handleSumTable">汇总表格</button>
      <button @click="handleCalcHashSparkMd5">calcHashSparkMd5</button>
      <button @click="handleCalcHashWasm10Concurrent">
        calcFilesHashWasm 10个并发
      </button>
      <button @click="handleCalcHashWasm4Concurrent">
        calcFilesHashWasm 4个并发
      </button>
      <button @click="handleCalcHashWasmSingleMode">
        calcHashWasmSingleMode
      </button>

      <button @click="handleCalcFilesHashWasmBatch">
        calcFilesHashWasmBatch
      </button>
    </div>

    <div>
      <div v-for="(item, index) in hashResult" :key="item.name + index">
        <span>{{ item.name }} : {{ item.throughput }}</span>
      </div>
    </div>

    <vxe-grid v-bind="gridOptions"></vxe-grid>
  </main>
</template>
