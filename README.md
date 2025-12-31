# Word 批量处理工具台

一个可离线使用的工具包，提供**本地网页界面**与**命令行脚本**，帮助你在内网环境批量处理 Word 文件：

- 🗂️ **批量改名**：统一日期前缀，保留公司名，可通过网页或命令行运行。
- 📝 **批量改内容**：按映射表替换正文与表格文本，结果自动打包下载。
- ✅ **纯本地运行**：无需联网，上传 ZIP 即可处理；或直接用脚本。

## 快速开始（网页模式）
1. 安装依赖：`pip install -r requirements.txt`
2. 运行：`python app.py`
3. 浏览器打开 `http://localhost:5000`
4. 将要处理的 `.docx` 放入文件夹并压缩为 `.zip`，上传即可获得处理后的 ZIP。

## 命令行脚本（无需网页）
- Windows PowerShell：使用页面上的命令生成器或下载 `rename-windows-*.ps1`
- macOS / Linux：下载 `rename-macos.sh`
- 批量替换内容：下载 `batch_replace.py`，按字典设置替换项后运行。

## 仓库结构
```
├── app.py                # Flask 后端，处理 ZIP 并返回结果 ZIP
├── index.html            # 前端页面（与 app.py 一起本地运行）
├── requirements.txt      # 依赖列表
├── static/
│   ├── css/styles.css    # 自定义样式
│   └── js/main.js        # 交互逻辑：上传、调用 API、生成命令/脚本
└── samples.json          # 示例数据（未使用）
```
