## FileReaderTool 使用示例

```ts
// 使用示例
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/png'];
        const validFiles = files.filter((file) =>
            FileReaderTool.checkFileType(file, allowedTypes)
        );

        if (validFiles.length === 0) {
            console.log('没有选择有效的文件类型');
            return;
        }

        // 批量读取文件为数据 URL 并监听进度
        const dataUrls = await FileReaderTool.batchRead(
            validFiles,
            'readAsDataURL',
            (event) => {
                if (event.lengthComputable) {
                    console.log(`Progress: ${(event.loaded / event.total) * 100}%`);
                }
            }
        );

        console.log('Data URLs:', dataUrls);

        // 取消某个文件的读取（如果需要）
        // const progressiveReader = FileReaderTool.createProgressiveReader(validFiles[0]);
        // progressiveReader.abort();

    } catch (error) {
        console.error('Error reading files:', error);
    }
}
```
