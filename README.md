# Evacuation Command

Evacuation Command 是一个浏览器端 2D 网页游戏项目。当前阶段使用 Phaser、TypeScript 和 Vite 搭建最小可运行场景，所有游戏对象均通过 Phaser Graphics 程序化绘制，不依赖外部美术、音乐或字体素材。

## 当前版本功能

- 页面标题为 `Evacuation Command`。
- 游戏画面使用 960×540 的设计分辨率，并通过 Phaser Scale FIT 随浏览器窗口等比缩放、居中显示。
- 深色背景和简易地图边界、网格均由 Phaser Graphics 绘制。
- 蓝色圆形玩家角色由 Phaser Graphics 绘制。
- 支持 `W`、`A`、`S`、`D` 控制玩家移动。
- 玩家移动会被限制在地图边界内。
- 左上角显示项目名称和中文操作提示。
- 按 `R` 可以重新开始当前场景。

## 环境要求

- Node.js 20.19+ 或 22.12+
- npm 10+

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

默认开发服务器地址为 <http://localhost:5173>。

## 生产构建

```bash
npm run build
```

构建产物会输出到 `dist/` 目录。

## 本地预览生产构建

```bash
npm run preview
```

## 核心依赖

- Phaser：浏览器端 2D 游戏框架。
- TypeScript：静态类型检查和开发语言。
- Vite：开发服务器和生产构建工具。
