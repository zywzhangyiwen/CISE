import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';

const router = Router();

router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

export default router;  // 确保使用 export default