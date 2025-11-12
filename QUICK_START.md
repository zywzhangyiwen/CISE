# 快速开始 - Vercel 部署

## 5 分钟快速部署指南

### 步骤 1: 准备 MongoDB (2 分钟)

1. 访问 https://cloud.mongodb.com 并注册/登录
2. 创建免费集群 (M0)
3. 创建数据库用户（记住用户名和密码）
4. 配置网络访问：添加 IP `0.0.0.0/0`（允许所有 IP）
5. 获取连接字符串：
   - 点击 "Connect" -> "Connect your application"
   - 复制连接字符串
   - 替换 `<password>` 为你的数据库密码

### 步骤 2: 部署后端 (2 分钟)

#### 使用 Render (推荐 - 免费) ⭐

1. 访问 https://render.com 并使用 GitHub 登录
2. 点击 "New" -> "Web Service"
3. 连接你的 GitHub 仓库
4. 配置项目:
   - Name: `speed-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: 选择 **Free** 免费计划
5. 添加环境变量:
   ```
   MONGODB_URI=你的MongoDB连接字符串
   JWT_SECRET=随机生成的密钥（使用下面的命令生成）
   PORT=5000
   NODE_ENV=production
   ```
6. 生成 JWT_SECRET:
   ```bash
   # Windows PowerShell
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   ```
7. 点击 "Create Web Service"
8. 部署完成后，复制后端 URL (例如: `https://speed-backend.onrender.com`)

**注意**: Render 免费层在 15 分钟无活动后会休眠，首次访问需要等待几秒唤醒。

### 步骤 3: 部署前端 (1 分钟)

1. 访问 https://vercel.com 并使用 GitHub 登录
2. 点击 "Add New..." -> "Project"
3. 导入你的 GitHub 仓库
4. **重要：配置项目设置**:
   - Framework Preset: Next.js
   - **Root Directory: 点击 Edit，输入 `frontend`** ⚠️ 必须设置！
   - 添加环境变量:
     ```
     NEXT_PUBLIC_API_BASE_URL=你的后端URL（从步骤2）
     ```
5. 点击 "Deploy"
6. 部署完成后，复制前端 URL (例如: `https://your-app.vercel.app`)

**如果遇到 "No Next.js version detected" 错误，查看 [VERCEL_SETUP.md](./VERCEL_SETUP.md)**

### 步骤 4: 更新后端 CORS (1 分钟)

1. 回到 Render 项目设置
2. 在 Environment 部分，更新环境变量 `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=你的前端URL（从步骤3）
   ```
3. 点击 "Save Changes"，服务会自动重新部署

### 完成！

现在你的应用已经部署完成。访问前端 URL 测试功能。

## 环境变量清单

### 后端 (Railway)
- ✅ `MONGODB_URI` - MongoDB 连接字符串
- ✅ `JWT_SECRET` - JWT 密钥
- ✅ `PORT` - 5000
- ✅ `NODE_ENV` - production
- ✅ `CORS_ORIGIN` - 前端 URL

### 前端 (Vercel)
- ✅ `NEXT_PUBLIC_API_BASE_URL` - 后端 URL

## 测试部署

1. 访问前端 URL
2. 注册新用户
3. 登录
4. 测试功能

## 遇到问题？

查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细说明和故障排除指南。

