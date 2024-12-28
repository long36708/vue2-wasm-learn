# vue2-wasm-learn

使用 `hash-wasm` 的 `createMD5`方法，生成md5值，批处理500张图片会报错，
`RangeError: WebAssembly.instantiate(): Out of memory: Cannot allocate Wasm memory for new instance`

解决方案：
1. 单例模式复用 MD5 实例
2. 批量处理文件
3. 并发控制 使用``p-limit`进行并发控制，测试10个并发的时候，不会报错
