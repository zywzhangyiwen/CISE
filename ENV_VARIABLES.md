# 环境变量配置说明

本文档详细说明项目所需的环境变量。

## 后端环境变量

创建 `backend/.env` 文件（不要提交到 Git）：

### 必需变量

#### MONGODB_URI
- **说明**: MongoDB 数据库连接字符串
- **格式**: 
  - 本地: `mongodb://localhost:27017/speed`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **示例**: `mongodb+srv://user:pass@cluster.mongodb.net/speed?retryWrites=true&w=majority`

#### JWT_SECRET
- **说明**: JWT 令牌签名密钥（用于用户认证）
- **要求**: 使用强随机字符串，至少 32 字符
- **生成方法**:
  ```bash
  # Linux/Mac
  openssl rand -base64 32
  
  # Windows PowerShell
  [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  ```
- **示例**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

### 可选变量

#### PORT
- **说明**: 服务器监听端口
- **默认值**: `5000`
- **示例**: `5000`

#### NODE_ENV
- **说明**: 运行环境
- **可选值**: `development`, `production`, `test`
- **默认值**: `development`
- **示例**: `production`

#### CORS_ORIGIN
- **说明**: 允许的 CORS 源（逗号分隔）
- **格式**: `origin1,origin2,origin3`
- **默认值**: `http://localhost:3000` (开发环境)
- **示例**: `https://your-app.vercel.app,https://www.yourdomain.com`

## 前端环境变量

创建 `frontend/.env.local` 文件（不要提交到 Git）：

### 必需变量

#### NEXT_PUBLIC_API_BASE_URL
- **说明**: 后端 API 的基础 URL
- **格式**: 
  - 本地: `http://localhost:5000`
  - 生产: `https://your-backend.railway.app`
- **注意**: 变量名必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
- **示例**: `https://speed-api.railway.app`

## 环境变量文件示例

### backend/.env (本地开发)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/speed

# JWT Secret
JWT_SECRET=your-secret-key-change-this-in-production

# Server Port
PORT=5000

# Environment
NODE_ENV=development

# CORS Origins
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local (本地开发)

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## 生产环境配置

### Vercel (前端)

在 Vercel 项目设置中添加环境变量：

1. 进入项目设置
2. 点击 "Environment Variables"
3. 添加变量:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.railway.app`
4. 选择环境: Production, Preview, Development
5. 点击 "Save"
6. 重新部署项目

### Railway/Render (后端)

在部署平台的项目设置中添加环境变量：

1. 进入项目设置
2. 找到 "Environment Variables" 或 "Secrets"
3. 添加以下变量:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/speed
   JWT_SECRET=your-strong-random-secret-key
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. 保存并重启服务

## 安全注意事项

1. **永远不要提交 `.env` 文件到 Git**
   - 确保 `.env` 在 `.gitignore` 中
   - 使用 `.env.example` 作为模板

2. **使用强密码和密钥**
   - JWT_SECRET 至少 32 字符
   - MongoDB 密码要足够复杂

3. **限制访问**
   - MongoDB Atlas: 只允许必要的 IP 地址
   - CORS: 只允许必要的域名

4. **定期轮换密钥**
   - 定期更换 JWT_SECRET
   - 定期更新数据库密码

5. **使用环境变量管理工具**
   - 生产环境使用平台提供的密钥管理
   - 不要硬编码敏感信息

## 验证环境变量

### 后端验证

在 `backend/src/app.ts` 中添加日志（仅开发环境）：

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN || 'Using default');
}
```

### 前端验证

在浏览器控制台中检查：

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
```

或在代码中：

```typescript
// frontend/src/utils/api.ts
console.log('API_BASE_URL:', API_BASE_URL);
```

## 故障排除

### 环境变量未加载

1. **后端**:
   - 确保 `dotenv.config()` 在文件开头
   - 检查 `.env` 文件位置（应在 `backend/` 目录）
   - 重启开发服务器

2. **前端**:
   - 确保变量名以 `NEXT_PUBLIC_` 开头
   - 重启开发服务器
   - 清除 `.next` 缓存: `rm -rf .next`

### 变量值不正确

1. 检查变量名拼写
2. 检查是否有空格或特殊字符
3. 确保引号使用正确（通常不需要引号）
4. 检查平台特定的变量格式要求

### 生产环境变量不生效

1. **Vercel**: 
   - 变量更改后需要重新部署
   - 检查变量作用域（Production/Preview/Development）

2. **Railway/Render**:
   - 变量更改后需要重启服务
   - 检查变量名和值格式

## 参考资源

- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel 环境变量](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway 环境变量](https://docs.railway.app/develop/variables)
- [Render 环境变量](https://render.com/docs/environment-variables)
- [MongoDB Atlas 连接字符串](https://www.mongodb.com/docs/atlas/connection-string/)

