"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const articleController_1 = require("../controllers/articleController");
const searchController_1 = require("../controllers/searchController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// 公开路由 - 搜索和查看文章
router.get('/search', validation_1.validateSearchParams, searchController_1.searchArticles);
router.get('/filters', searchController_1.getSearchFilters);
// 特定静态路由先注册，避免被后面的动态 `/:id` 路由捕获
router.get('/pending', auth_1.authenticate, (0, auth_1.authorize)('moderator', 'admin'), articleController_1.getPendingArticles);
// Dev helper: expose pending without auth for local debugging (only available in non-production)
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug/pending', articleController_1.getPendingArticles);
}
// 返回当前用户自己提交的文章（需要认证）
router.get('/mine', auth_1.authenticate, articleController_1.getMySubmissions);
router.post('/submit', validation_1.validateArticleSubmission, articleController_1.submitArticle);
// 分析师相关：获取待分析列表与提交分析结果
router.get('/analysis/pending', auth_1.authenticate, (0, auth_1.authorize)('analyst', 'moderator', 'admin'), articleController_1.getPendingAnalysis);
router.put('/:id/analyze', auth_1.authenticate, (0, auth_1.authorize)('analyst', 'moderator', 'admin'), articleController_1.analyzeArticle);
// 动态路由（:id）应放在特定路径之后
router.get('/:id', searchController_1.getArticleDetails);
router.post('/:id/rate', searchController_1.rateArticle);
// 需要认证的路由 - 审核功能
router.put('/:id/moderate', auth_1.authenticate, (0, auth_1.authorize)('moderator', 'admin'), validation_1.validateArticleModeration, articleController_1.moderateArticle);
exports.default = router;
