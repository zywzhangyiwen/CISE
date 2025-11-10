# Vercel 部署设置指南

## 问题解决：Root Directory 配置

如果遇到 "No Next.js version detected" 错误，这是因为 Vercel 需要在项目设置中指定正确的 Root Directory。

## 解决步骤

### 方法 1: 在 Vercel 项目设置中配置（推荐）

1. **导入项目后，在项目设置中配置**：
   - 进入 Vercel Dashboard
   - 选择你的项目
   - 点击 **Settings** (设置)
   - 找到 **General** -> **Root Directory**
   - 点击 **Edit**
   - 选择 `frontend` 目录
   - 点击 **Save**

2. **或者在导入时设置**：
   - 在导入项目页面
   - 找到 **Configure Project** 部分
   - 展开 **Root Directory**
   - 输入: `frontend`
   - 然后继续部署

### 方法 2: 使用 vercel.json 配置

如果项目已经在 Vercel 中，可以更新 `frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### 方法 3: 重新导入项目

1. 删除现有项目（如果需要）
2. 重新导入 GitHub 仓库
3. **在配置页面明确设置 Root Directory 为 `frontend`**
4. 配置环境变量
5. 部署

## 完整的 Vercel 设置步骤

### 步骤 1: 导入项目

1. 访问 https://vercel.com
2. 点击 **Add New...** -> **Project**
3. 选择你的 GitHub 仓库
4. 点击 **Import**

### 步骤 2: 配置项目设置

在 **Configure Project** 页面：

1. **Project Name**: 可以保持默认或自定义
2. **Framework Preset**: Next.js (应该自动检测)
3. **Root Directory**: 
   - 点击 **Edit**
   - 选择 `frontend` 目录
   - **这是关键步骤！**
4. **Build Command**: `npm run build` (自动检测)
5. **Output Directory**: `.next` (自动检测)
6. **Install Command**: `npm install` (自动检测)

### 步骤 3: 配置环境变量

在 **Environment Variables** 部分：

- 添加变量:
  - **Name**: `NEXT_PUBLIC_API_BASE_URL`
  - **Value**: 你的后端 API URL (例如: `https://your-backend.render.com`)
  - **Environment**: 选择 Production, Preview, Development

### 步骤 4: 部署

1. 点击 **Deploy**
2. 等待构建完成
3. 获取部署 URL

## 验证配置

部署成功后，检查：

1. **构建日志**: 应该显示 Next.js 构建过程
2. **部署 URL**: 访问 URL 应该能看到前端页面
3. **环境变量**: 在代码中可以通过 `process.env.NEXT_PUBLIC_API_BASE_URL` 访问

## 常见问题

### Q: 为什么会出现 "No Next.js version detected" 错误？

**A**: 因为 Vercel 在仓库根目录查找 `package.json`，但 Next.js 项目在 `frontend/` 目录下。需要设置 Root Directory 为 `frontend`。

### Q: 我已经设置了 Root Directory，但还是报错？

**A**: 检查以下几点：
1. Root Directory 路径是否正确（应该是 `frontend`，不是 `./frontend` 或 `/frontend`）
2. `frontend/package.json` 中是否有 `next` 依赖
3. 清除构建缓存并重新部署

### Q: 如何更新 Root Directory 设置？

**A**:
1. 进入项目 Settings
2. 找到 General -> Root Directory
3. 点击 Edit
4. 修改为 `frontend`
5. 保存并重新部署

### Q: 可以在代码中配置 Root Directory 吗？

**A**: 可以，但推荐在 Vercel 项目设置中配置，这样更清晰明确。

## 项目结构说明

```
worksheet4/
├── frontend/          ← Next.js 项目在这里
│   ├── package.json  ← 包含 next 依赖
│   ├── vercel.json
│   └── ...
├── backend/           ← 后端项目（部署到其他平台）
└── ...
```

Vercel 需要知道 Next.js 项目在 `frontend/` 目录下。

## 下一步

配置完成后，继续：
1. 部署后端（Render 或其他平台）
2. 更新 `NEXT_PUBLIC_API_BASE_URL` 环境变量
3. 测试应用功能

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取完整部署指南。

