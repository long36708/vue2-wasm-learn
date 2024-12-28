/**
 * @Author: longmo
 * @Date: 2024-12-28 19:41:58
 * @LastEditTime: 2024-12-28 20:37:07
 * @FilePath: src/composables/useHashWasm.ts
 * @Description:
 */
import { useQuery } from "@tanstack/vue-query";
import BenchmarkTool from "@/utils/BenchmarkTool";
import { calcFilesHashWasm10Concurrent } from "@/utils/caclFilesHashWasm";

const ITERATIONS = 1; // 测试次数

export const keysQuery = ["hashWasm"];
export const useHashWasmQuery = (files) =>
  useQuery({
    queryKey: [keysQuery, files],
    queryFn: async () => {
      console.log(files);
      const benchmark = new BenchmarkTool();
      // 运行基准测试
      await benchmark.runAsync(
        calcFilesHashWasm10Concurrent,
        ITERATIONS,
        files
      ); // 执行 exampleFunction 5 次
      return benchmark;
    },
    enabled: false,
  });
