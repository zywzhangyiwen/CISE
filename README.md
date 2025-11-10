# SPEED Project

SPEED (Software Practice Evidence Ecosystem Database) - 软件实践证据生态系统数据库

## 项目结构

```
worksheet4/
├── frontend/          # Next.js 前端应用
├── backend/           # Express API 后端服务
├── DEPLOYMENT.md      # 详细部署指南
├── QUICK_START.md     # 快速开始指南
├── ENV_VARIABLES.md   # 环境变量配置说明
└── DEPLOYMENT_CHECKLIST.md  # 部署检查清单
```

## 快速开始

### 本地开发

1. **启动后端**
   ```bash
   cd backend
   npm install
   # 创建 .env 文件并配置环境变量
   npm run dev
   ```

2. **启动前端**
   ```bash
   cd frontend
   npm install
   # 创建 .env.local 文件并配置环境变量
   npm run dev
   ```

### 部署到生产环境

查看 [QUICK_START.md](./QUICK_START.md) 获取 5 分钟快速部署指南。

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 环境变量

### 后端环境变量

创建 `backend/.env` 文件：

```env
MONGODB_URI=mongodb://localhost:27017/speed
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### 前端环境变量

创建 `frontend/.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

详细环境变量说明请参考 [ENV_VARIABLES.md](./ENV_VARIABLES.md)。

## 部署平台

- **前端**: Vercel (https://vercel.com)
- **后端**: Railway (https://railway.app) 或 Render (https://render.com)
- **数据库**: MongoDB Atlas (https://cloud.mongodb.com)

## 文档

- [部署指南](./DEPLOYMENT.md) - 详细的部署步骤和说明
- [快速开始](./QUICK_START.md) - 5 分钟快速部署
- [环境变量配置](./ENV_VARIABLES.md) - 环境变量详细说明
- [部署检查清单](./DEPLOYMENT_CHECKLIST.md) - 部署检查清单

## 技术栈

### 前端
- Next.js 15
- React 19
- TypeScript
- Sass

### 后端
- Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT 认证

## 功能特性

- 用户认证（注册、登录）
- 文章提交和管理
- 文章审核
- 文章搜索
- 管理员功能

## 开发

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 运行开发服务器

```bash
# 后端 (端口 5000)
cd backend
npm run dev

# 前端 (端口 3000)
cd frontend
npm run dev
```

### 构建

```bash
# 后端
cd backend
npm run build

# 前端
cd frontend
npm run build
```

## 贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

MIT License

## 支持

如果遇到问题，请查看：
1. [部署文档](./DEPLOYMENT.md)
2. [环境变量文档](./ENV_VARIABLES.md)
3. 项目 Issues

## 相关链接

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [MongoDB Atlas 文档](https://www.mongodb.com/docs/atlas/)
- [Next.js 文档](https://nextjs.org/docs)
- [Express 文档](https://expressjs.com/)

