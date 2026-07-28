import { Router } from 'express';
import { validate } from '../../middleware/validation.ts';
import authController from './auth.controller.ts';
import {
  checkEmailSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from './auth.validation.ts';

const router: Router = Router();

/**
 * @method POST
 * @route /auth/check-email
 * @description Check if a user with the given email already exists
 */
router.post(
  '/check-email',
  validate(checkEmailSchema),
  authController.checkEmail,
);

/**
 * @method POST
 * @route /auth/register
 * @description Register a new user with name, email, and password
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @method POST
 * @route /auth/login
 * @description Authenticate a user with email and password
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @method POST
 * @route /auth/refresh
 * @description Refresh an access token using a valid refresh token
 */
router.post('/refresh', validate(refreshSchema), authController.refresh);

/**
 * @method POST
 * @route /auth/logout
 * @description Invalidate the refresh token and log the user out
 */
router.post('/logout', validate(refreshSchema), authController.logout);

export const authRouter = router;
