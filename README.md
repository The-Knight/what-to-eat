# 今天吃什么

一个帮你决定每天吃什么的菜谱管理应用。不知道吃什么？选好几荤几素，让命运来决定！

## 功能特点

- **菜谱管理**：支持新建、编辑、删除菜谱，包含食材用量、烹饪步骤、小贴士等完整信息
- **荤素分类**：每道菜标记荤菜/素菜，卡片上直观显示
- **随机选菜**：选择想要的荤菜和素菜数量，一键随机搭配今天的菜单
- **分类筛选**：支持按家常菜、汤品、甜点、主食分类浏览
- **搜索功能**：按菜名搜索菜谱
- **图片上传**：支持上传菜谱封面图
- **响应式设计**：适配手机和电脑端
- **内置数据**：包含 19 道菜谱和封面图片，克隆即可使用

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 后端 | Express.js |
| 数据库 | SQLite (better-sqlite3) |
| 图标 | Lucide React |

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/The-Knight/what-to-eat.git

# 进入项目目录
cd what-to-eat

# 安装依赖
npm install

# 启动开发服务器（同时启动前端和后端）
npm run dev
```

启动后访问 http://localhost:5173

## 项目结构

```
├── api/                    # 后端代码
│   ├── db/                 # 数据库配置和种子数据
│   ├── routes/             # API 路由
│   ├── app.ts              # Express 应用配置
│   └── server.ts           # 服务器入口
├── src/                    # 前端代码
│   ├── components/         # 通用组件（Navbar、RecipeCard 等）
│   ├── pages/              # 页面组件
│   ├── store/              # Zustand 状态管理
│   └── utils/              # API 客户端和类型定义
├── data/
│   └── recipes.db          # SQLite 数据库（含 19 道菜谱）
└── uploads/                # 菜谱封面图片（31 张）
```

## 内置菜谱

应用预置了 19 道菜谱，包含荤菜和素菜：

| 荤菜 | 素菜 |
|------|------|
| 番茄炒蛋 | 蛋炒饭 |
| 凉拌鸡丝 | 凉拌蕨根粉 |
| 双椒兔丁 | 酸辣土豆丝 |
| 菠萝咕咾肉 | 番茄土豆肥牛煲 |
| 可乐鸡翅 | 麻辣土豆丁 |
| 青椒肉丝 | 素烧茄子 |
| 糖醋排骨 | 酸溜豆芽 |
| 青椒虾滑 | 炝炒莲白 |
| 干煸四季豆（荤） | |
| 肉沫茄子（荤） | |
| 白菜炖粉条（荤） | |

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/recipes` | 获取菜谱列表（支持 ?category= 和 ?search= 筛选） |
| GET | `/api/recipes/:id` | 获取单个菜谱详情 |
| POST | `/api/recipes` | 新建菜谱 |
| PUT | `/api/recipes/:id` | 更新菜谱 |
| DELETE | `/api/recipes/:id` | 删除菜谱 |
| GET | `/api/categories` | 获取分类列表 |
| POST | `/api/upload` | 上传图片 |
