import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getConfig, upsertConfig, patchArticle, removeRating } from '../controllers/adminController';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/config', getConfig);
router.put('/config', upsertConfig);

router.patch('/articles/:idOrDoi', patchArticle);
router.delete('/articles/:id/ratings', removeRating);

export default router;


