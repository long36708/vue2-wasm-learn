<script setup>
import { ref } from "vue";
import BenchmarkTool from "@/utils/BenchmarkTool";
import { calcFilesSparkMd5 } from "@/utils/calcFilesSparkMd5";
import {
  calcFilesHashWasmSingleMode,
  calcFilesHashWasm10Concurrent,
  calcFilesHashWasmConcurrent,
} from "@/utils/caclFilesHashWasm";
import { useHashWasmQuery } from "@/composables/useHashWasm";
import { useQuery } from "@tanstack/vue-query";

const imgFileList = ref([]);

const hashResult = ref([]);

const ITERATIONS = 1;
const { refetch } = useHashWasmQuery();
/**
 * 计算单个文件的 SparkMD5 哈希值
 * 不分块计算
 * @param file
 * @returns {Promise<unknown>}
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
  const benchmark = new BenchmarkTool();
  // 运行基准测试
  await benchmark.runAsync(calcFilesSparkMd5, ITERATIONS, imgFileList.value); // 执行 exampleFunction 5 次

  // 获取平均执行时间
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  hashResult.value.push({
    name: "sparkMd5",
    value: benchmark.getAverageElapsedTime().toFixed(4),
  });
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasm4Concurrent = async () => {
  const count = 4;
  const benchmark = new BenchmarkTool();
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

  hashResult.value = [
    ...hashResult.value,
    {
      name: `HashWasm ${count}个并发`,
      value: benchmark.getAverageElapsedTime().toFixed(4),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasm10Concurrent = async () => {
  const benchmark = new BenchmarkTool();
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

  hashResult.value = [
    ...hashResult.value,
    {
      name: "HashWasm 10个并发",
      value: benchmark.getAverageElapsedTime().toFixed(4),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
};

const handleCalcHashWasmSingleMode = async () => {
  const benchmark = new BenchmarkTool();
  await benchmark.runAsync(
    calcFilesHashWasmSingleMode,
    ITERATIONS,
    imgFileList.value
  );
  console.log(
    `Average elapsed time: ${benchmark.getAverageElapsedTime().toFixed(4)} ms`
  );

  hashResult.value = [
    ...hashResult.value,
    {
      name: "HashWasm单例模式",
      value: benchmark.getAverageElapsedTime().toFixed(4),
    },
  ];
  // 清除样本数据
  benchmark.clearSamples();
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
    </div>

    <div>
      <div v-for="(item, index) in hashResult" :key="item.name + index">
        <span>{{ item.name }} : {{ item.value }}</span>
      </div>
    </div>
  </main>
</template>
