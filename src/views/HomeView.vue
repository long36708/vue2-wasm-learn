<script setup>
import { computed, ref } from "vue";
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

const loading = ref(false);
const gridOptions = ref({
  border: true,
  exportConfig: {},
  toolbarConfig: {
    export: true,
    zoom: true,
  },
  columnConfig: {
    // resizable: true,
  },
  columns: [
    { type: "checkbox", width: 50 },
    { type: "seq", width: 70 },
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
  data: computed(() => hashResult.value),
});

/**
 * 计算单个文件的 SparkMD5 哈希值
 * 不分块计算
 * @returns {Promise<unknown>}
 * @param e
 */
const handleFileChange = async (e) => {
  const { files } = e.target;
  if (!files || files.length === 0) {
    console.log("No files selected");
    return;
  }

  // 验证文件是否有效
  const validFiles = Array.from(files).filter((file) => file.size > 0);
  if (validFiles.length === 0) {
    console.log("All selected files are invalid");
    return;
  }
  imgFileList.value = files;
  // console.log("Selected files:", validFiles);
};

const runBenchmarkSafe = async (taskName, calcFunction, ...args) => {
  try {
    const benchmark = new BenchmarkTool({ taskName });
    await benchmark.runAsync(calcFunction, ITERATIONS, ...args);

    const averageElapsedTime = benchmark.getAverageElapsedTime().toFixed(4);
    console.log(`Average elapsed time: ${averageElapsedTime} ms`);

    const throughput = calcThroughputBy(args[0], benchmark);
    hashResult.value.push({
      ...throughput,
      ...benchmark.getResult(),
    });

    // 清除样本数据
    await benchmark.clearSamples();
  } catch (error) {
    console.error(`Error during benchmark for ${taskName}:`, error);
  }
};

const tasks = computed(() => [
  {
    name: "HashSparkMd5",
    func: calcFilesSparkMd5,
    args: [imgFileList.value],
  },
  {
    name: "HashWasm 4个并发",
    func: calcFilesHashWasmConcurrent,
    args: [imgFileList.value, 4],
  },
  {
    name: "HashWasm 10个并发",
    func: calcFilesHashWasm10Concurrent,
    args: [imgFileList.value],
  },
  {
    name: "HashWasm Batch",
    func: calcFilesHashWasmBatch,
    args: [imgFileList.value],
  },
  {
    name: "HashWasmSingleMode",
    func: calcFilesHashWasmSingleMode,
    args: [imgFileList.value],
  },
  // {
  //   name: "HashWasm Batch",
  //   func: calcFilesHashWasm,
  //   args: [imgFileList.value],
  // },
]);

const runBenchmark = async (taskName, calcFunction, ...args) => {
  return new Promise(async (resolve, reject) => {
    try {
      const benchmark = new BenchmarkTool({ taskName });
      console.log("args", args);
      await benchmark.runAsync(calcFunction, ITERATIONS, ...args);
      const averageElapsedTime = benchmark.getAverageElapsedTime().toFixed(4);
      console.log(`Average elapsed time: ${averageElapsedTime} ms`);

      const throughput = calcThroughputBy(args[0], benchmark);
      hashResult.value.push({
        ...throughput,
        ...benchmark.getResult(),
      });
      // 清除样本数据
      await benchmark.clearSamples();
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
const handleCalcHashSparkMd5 = () =>
  runBenchmarkSafe("HashSparkMd5", calcFilesSparkMd5, imgFileList.value);

const handleCalcHashWasm4Concurrent = () =>
  runBenchmarkSafe(
    "HashWasm 4个并发",
    calcFilesHashWasmConcurrent,
    imgFileList.value,
    4
  );

const handleCalcHashWasm10Concurrent = () =>
  runBenchmarkSafe(
    "HashWasm 10个并发",
    calcFilesHashWasm10Concurrent,
    imgFileList.value
  );

const handleCalcHashWasmSingleMode = () =>
  runBenchmarkSafe(
    "HashWasm 单个模式",
    calcFilesHashWasmSingleMode,
    imgFileList.value
  );

const handleCalcFilesHashWasmBatch = () =>
  runBenchmarkSafe("HashWasm Batch", calcFilesHashWasmBatch, imgFileList.value);

/**
 * 一键启动
 */
const handleStart = async () => {
  if (!imgFileList.value.length) return alert("请选择文件");
  try {
    loading.value = true;
    for (const task of tasks.value) {
      await runBenchmark(task.name, task.func, ...task.args);
    }
  } catch (e) {
    console.error(e);
    alert(`测试失败${e}`);
  } finally {
    loading.value = false;
    handleSumTable();
  }
};

const handleSumTable = () => {
  // gridOptions.value.data = hashResult.value;
  loading.value = false;
};

const reset = () => {
  hashResult.value = [];
  // gridOptions.value.data = [];
};
</script>

<template>
  <main>
    <div>Home</div>

    <div>警告：运行基准测试时需要关闭 DevTools，否则会影响性能。</div>
    <div>
      <input type="file" multiple accept="image/*" @change="handleFileChange" />
    </div>

    <div>
      当前文件数量：
      <span>{{ imgFileList.length }}</span>
    </div>

    <div>
      <button @click="handleStart" :disabled="loading">一键启动测试</button>
      <button @click="handleSumTable" :disabled="loading">汇总表格</button>
      <button @click="reset" :disabled="loading">重置表格</button>

      <button @click="handleCalcHashSparkMd5" :disabled="loading">
        calcHashSparkMd5
      </button>
      <button @click="handleCalcHashWasm10Concurrent" :disabled="loading">
        calcFilesHashWasm 10个并发
      </button>
      <button @click="handleCalcHashWasm4Concurrent" :disabled="loading">
        calcFilesHashWasm 4个并发
      </button>
      <button @click="handleCalcHashWasmSingleMode" :disabled="loading">
        calcHashWasmSingleMode
      </button>

      <button @click="handleCalcFilesHashWasmBatch" :disabled="loading">
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
