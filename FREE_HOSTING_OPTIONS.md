# 免费后端托管选项

本文档介绍可用于部署后端 API 的免费托管平台。

## 推荐方案

### 1. Render (⭐ 最推荐)

**免费层特点**:
- ✅ 完全免费
- ✅ 512MB RAM
- ✅ 0.1 CPU
- ✅ 自动 SSL 证书
- ✅ 自动部署（GitHub 集成）
- ⚠️ 15 分钟无活动后会休眠（首次访问需要等待几秒唤醒）

**适用场景**: 学习项目、小型项目、演示项目

**注册**: https://render.com

**部署步骤**: 参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 中的 Render 部分

---

### 2. Railway

**免费额度**:
- ✅ $5 免费额度/月
- ✅ 超出后按使用量付费
- ✅ 无休眠限制
- ✅ 自动部署

**适用场景**: 需要持续运行的服务

**注册**: https://railway.app

**注意**: 免费额度有限，适合短期测试。如果项目使用量较大，可能会产生费用。

---

### 3. Fly.io

**免费层特点**:
- ✅ 3 个共享 CPU 实例（256MB RAM）
- ✅ 3GB 出站流量/月
- ✅ 无休眠限制
- ✅ 全球边缘部署

**适用场景**: 需要低延迟的全球部署

**注册**: https://fly.io

---

### 4. Cyclic.sh

**免费层特点**:
- ✅ 完全免费
- ✅ 无休眠限制
- ✅ 自动部署
- ✅ Serverless 架构

**适用场景**: Serverless 应用

**注册**: https://cyclic.sh

---

### 5. Koyeb

**免费层特点**:
- ✅ 2 个服务（512MB RAM）
- ✅ 自动部署
- ✅ 全球边缘部署
- ⚠️ 有使用限制

**注册**: https://www.koyeb.com

---

## 平台对比

| 平台 | 免费层 | 休眠 | 部署方式 | 推荐度 |
|------|--------|------|----------|--------|
| Render | ✅ 完全免费 | ⚠️ 15分钟无活动后休眠 | GitHub | ⭐⭐⭐⭐⭐ |
| Railway | ✅ $5/月额度 | ❌ 无休眠 | GitHub | ⭐⭐⭐⭐ |
| Fly.io | ✅ 3个实例 | ❌ 无休眠 | CLI/GitHub | ⭐⭐⭐⭐ |
| Cyclic | ✅ 完全免费 | ❌ 无休眠 | GitHub | ⭐⭐⭐ |
| Koyeb | ✅ 2个服务 | ❌ 无休眠 | GitHub | ⭐⭐⭐ |

## 选择建议

### 学习/演示项目
**推荐**: Render
- 完全免费
- 设置简单
- 适合学习和演示

### 需要持续运行的服务
**推荐**: Railway 或 Fly.io
- 无休眠限制
- 适合需要 24/7 运行的服务

### 全球部署
**推荐**: Fly.io 或 Koyeb
- 全球边缘部署
- 低延迟

## Render 免费层说明

### 休眠机制
- 服务在 15 分钟无活动后会进入休眠状态
- 首次访问休眠服务需要等待 30-60 秒唤醒
- 唤醒后服务正常运行

### 解决方案
1. **接受休眠**: 对于演示项目，可以接受首次访问的延迟
2. **使用监控服务**: 使用 UptimeRobot 等免费监控服务定期 ping 你的服务
3. **升级到付费计划**: 如果不需要休眠，可以升级到付费计划（$7/月起）

## 部署步骤

所有平台的部署步骤类似：

1. 注册账户
2. 连接 GitHub 仓库
3. 配置项目设置（Root Directory: `backend`）
4. 设置环境变量
5. 部署

详细步骤请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

## 环境变量配置

所有平台都需要配置以下环境变量：

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speed
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 故障排除

### Render 服务休眠
- **问题**: 首次访问很慢
- **解决**: 这是正常的，服务正在唤醒。可以设置监控服务定期访问。

### Railway 超出免费额度
- **问题**: 收到付费通知
- **解决**: 检查使用量，考虑迁移到 Render 或其他免费平台。

### 部署失败
- **问题**: 构建失败
- **解决**: 检查构建日志，确保 Root Directory 设置正确。

## 总结

对于学习和演示项目，**Render 是最佳选择**：
- ✅ 完全免费
- ✅ 设置简单
- ✅ 自动部署
- ✅ 适合大多数用例

如果项目需要持续运行且不能接受休眠，可以考虑 Railway（注意免费额度）或 Fly.io。

## 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - 环境变量配置

