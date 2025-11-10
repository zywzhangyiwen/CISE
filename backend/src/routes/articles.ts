import { Router } from 'express';
import { 
  submitArticle, 
  getPendingArticles, 
  moderateArticle,
  getMySubmissions,
  getPendingAnalysis,
  analyzeArticle
} from '../controllers/articleController';
import { 
  searchArticles as searchArticlesHandler,
  getSearchFilters,
  getArticleDetails,
  rateArticle
} from '../controllers/searchController';
import { authenticate, authorize } from '../middleware/auth';
import { 
  validateArticleSubmission, 
  validateArticleModeration,
  validateSearchParams 
} from '../middleware/validation';

const router = Router();

// 公开路由 - 搜索和查看文章
router.get('/search', validateSearchParams, searchArticlesHandler);
router.get('/filters', getSearchFilters);

// 特定静态路由先注册，避免被后面的动态 `/:id` 路由捕获
router.get('/pending', authenticate, authorize('moderator', 'admin'), getPendingArticles);
// Dev helper: expose pending without auth for local debugging (only available in non-production)
if (process.env.NODE_ENV !== 'production') {
  router.get('/debug/pending', getPendingArticles);
}
// 返回当前用户自己提交的文章（需要认证）
router.get('/mine', authenticate, getMySubmissions);
router.post('/submit', validateArticleSubmission, submitArticle);

// 分析师相关：获取待分析列表与提交分析结果
router.get('/analysis/pending', authenticate, authorize('analyst', 'moderator', 'admin'), getPendingAnalysis);
router.put('/:id/analyze', authenticate, authorize('analyst', 'moderator', 'admin'), analyzeArticle);

// 动态路由（:id）应放在特定路径之后
router.get('/:id', getArticleDetails);
router.post('/:id/rate', rateArticle);

// 需要认证的路由 - 审核功能
router.put('/:id/moderate', authenticate, authorize('moderator', 'admin'), validateArticleModeration, moderateArticle);

export default router;