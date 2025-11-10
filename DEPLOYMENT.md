# Vercel 部署指南

本文档说明如何将 SPEED 项目部署到 Vercel 和其他平台。

## 项目结构

- **前端**: Next.js 应用 (部署到 Vercel)
- **后端**: Express API (需要单独部署，推荐 Railway 或 Render)

## 前置要求

1. GitHub 账户
2. Vercel 账户 (免费注册: https://vercel.com)
3. MongoDB Atlas 账户 (免费注册: https://www.mongodb.com/cloud/atlas)
4. Railway 或 Render 账户 (用于后端部署)

## 第一步：准备 MongoDB 数据库

1. 登录 MongoDB Atlas: https://cloud.mongodb.com
2. 创建新集群（选择免费 M0 层）
3. 创建数据库用户
4. 配置网络访问（添加 IP 地址或允许所有 IP `0.0.0.0/0`）
5. 获取连接字符串 (Connection String)
   - 格式: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

## 第二步：部署后端 API

### 选项 A: 使用 Render (推荐 - 免费层可用) ⭐

**Render 提供免费层，适合小型项目和学习使用。**

1. 访问 https://render.com 并登录（使用 GitHub 账户）
2. 点击 "New" -> "Web Service"
3. 连接你的 GitHub 仓库
4. 配置项目：
   - **Name**: speed-backend
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: 选择 **Free** 免费计划
5. 添加环境变量：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speed?retryWrites=true&w=majority
   JWT_SECRET=your-strong-random-secret-key-here
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. 点击 "Create Web Service"
7. 部署完成后，获取后端 URL (例如: `https://speed-backend.onrender.com`)

**注意**: Render 免费层服务在 15 分钟无活动后会休眠，首次访问可能需要等待几秒唤醒。

### 选项 B: 使用 Railway (付费，但提供 $5 免费额度)

**Railway 提供 $5 免费额度，超出后按使用量付费。**

1. 访问 https://railway.app 并登录
2. 点击 "New Project" -> "Deploy from GitHub repo"
3. 选择你的 GitHub 仓库
4. 设置根目录为 `backend`
5. 配置环境变量（同 Render）：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speed?retryWrites=true&w=majority
   JWT_SECRET=your-strong-random-secret-key-here
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
6. Railway 会自动检测 Node.js 项目并部署
7. 部署完成后，获取后端 URL (例如: `https://your-app.railway.app`)

**注意**: Railway 免费额度有限，适合短期测试。生产环境建议使用 Render 免费层或其他平台。

## 第三步：部署前端到 Vercel

### 1. 连接 GitHub 仓库

1. 访问 https://vercel.com 并登录
2. 点击 "Add New..." -> "Project"
3. 导入你的 GitHub 仓库
4. 选择仓库并点击 "Import"

### 2. 配置项目设置（重要！）

**关键步骤：设置 Root Directory**

在 **Configure Project** 页面：

1. **Framework Preset**: Next.js (应该自动检测)
2. **Root Directory**: 
   - 点击 **Edit** 按钮
   - **输入 `frontend`** (这是关键！)
   - 必须设置，否则会报 "No Next.js version detected" 错误
3. **Build Command**: `npm run build` (自动检测)
4. **Output Directory**: `.next` (自动检测)
5. **Install Command**: `npm install` (自动检测)

**注意**: 如果不设置 Root Directory，Vercel 会在仓库根目录查找 Next.js 项目，导致构建失败。

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.railway.app
```

**重要**: 
- 变量名必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
- 将 `https://your-backend-api.railway.app` 替换为你的实际后端 URL

### 4. 部署

1. 点击 "Deploy"
2. 等待构建完成
3. 获取前端 URL (例如: `https://your-app.vercel.app`)

## 第四步：更新后端 CORS 配置

部署前端后，需要更新后端的 CORS 配置：

1. **Render**: 
   - 进入项目设置 -> Environment
   - 更新 `CORS_ORIGIN` 环境变量
   - 点击 "Save Changes"，自动重新部署

2. **Railway**: 
   - 进入项目设置 -> Variables
   - 更新 `CORS_ORIGIN` 环境变量
   - 服务会自动重新部署

**CORS_ORIGIN 值**:
```
CORS_ORIGIN=https://your-frontend.vercel.app
```
或者多个域名（逗号分隔）:
```
CORS_ORIGIN=https://your-frontend.vercel.app,https://your-custom-domain.com
```

## 环境变量总结

### 后端环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `MONGODB_URI` | MongoDB 连接字符串 | `mongodb+srv://user:pass@cluster.mongodb.net/speed` |
| `JWT_SECRET` | JWT 密钥（生成强随机字符串） | `your-secret-key-here` |
| `PORT` | 服务器端口 | `5000` |
| `NODE_ENV` | 环境类型 | `production` |
| `CORS_ORIGIN` | 允许的 CORS 源（逗号分隔） | `https://your-app.vercel.app` |

### 前端环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端 API 基础 URL | `https://your-backend.railway.app` |

## 生成 JWT Secret

在终端运行以下命令生成安全的 JWT Secret:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## 验证部署

### 1. 检查后端健康状态

访问: `https://your-backend.railway.app/api/health`

应该返回: `{"message":"SPEED API is running!"}`

### 2. 检查前端

访问你的 Vercel URL，应该能看到前端界面。

### 3. 测试功能

1. 注册新用户
2. 登录
3. 提交文章
4. 测试其他功能

## 常见问题

### CORS 错误

如果遇到 CORS 错误：
1. 确保后端的 `CORS_ORIGIN` 环境变量包含前端 URL
2. 确保 URL 格式正确（包括 `https://`）
3. 重启后端服务

### 数据库连接错误

1. 检查 MongoDB Atlas 网络访问设置（允许所有 IP 或添加服务器 IP）
2. 验证连接字符串格式正确
3. 检查数据库用户权限

### 环境变量不生效

1. 在 Vercel 中，环境变量更改后需要重新部署
2. 确保变量名正确（前端变量需要 `NEXT_PUBLIC_` 前缀）
3. 清除浏览器缓存

## 持续部署

配置完成后，每次推送到 GitHub 主分支都会自动触发部署：

- **前端**: Vercel 自动部署
- **后端**: Railway/Render 自动部署（如果已配置）

## 自定义域名

### Vercel 自定义域名

1. 在 Vercel 项目设置中，点击 "Domains"
2. 添加你的域名
3. 按照说明配置 DNS 记录

### 后端自定义域名

- **Railway**: 在项目设置中配置自定义域名
- **Render**: 在服务设置中配置自定义域名

## 监控和日志

- **Vercel**: 在项目 Dashboard 查看部署日志和性能指标
- **Railway**: 在项目 Dashboard 查看日志和指标
- **Render**: 在服务 Dashboard 查看日志

## 安全建议

1. **JWT Secret**: 使用强随机字符串，不要使用默认值
2. **MongoDB**: 限制网络访问，只允许必要的 IP
3. **环境变量**: 不要在代码中硬编码敏感信息
4. **HTTPS**: 生产环境始终使用 HTTPS
5. **CORS**: 只允许必要的域名访问 API

## 支持

如果遇到问题，请检查：
1. 部署日志
2. 环境变量配置
3. 网络连接
4. 数据库连接

## 更新部署

### 更新前端

```bash
git add .
git commit -m "Update frontend"
git push
```

Vercel 会自动部署。

### 更新后端

```bash
git add .
git commit -m "Update backend"
git push
```

Railway/Render 会自动部署（如果已配置自动部署）。

