import { Router } from 'express';
import { validate } from '../../middleware/validation.ts';
import authController from './auth.controller.ts';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from './auth.validation.ts';

const router: Router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(refreshSchema), authController.logout);

export const authRouter = router;
