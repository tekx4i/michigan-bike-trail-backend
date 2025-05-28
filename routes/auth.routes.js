import { Router } from 'express';

import {
	login,
	register,
	OtpVerify,
	ResendOTP,
	ForgotPassword,
	ResetPassword,
	getLoggedInUser,
	changePassword,
} from '../controllers';
import {
	validate,
	checkAuth,
	verifyOTP,
	isAuth,
	resetCheck,
} from '../middlewares';
import {
	loginSchema,
	registerSchema,
	verifySchema,
	resendOTPSchema,
	forgotSchema,
	resetSchema,
	changePasswordSchema,
} from '../validations';

const router = Router();
router.post('/change-password', isAuth, validate(changePasswordSchema), changePassword);
router.post('/login', validate(loginSchema), login);
router.post('/register', checkAuth, validate(registerSchema), register);
router.post('/verify/:id', validate(verifySchema), verifyOTP, OtpVerify);
router.get('/resendOTP/:id', validate(resendOTPSchema), ResendOTP);
router.post('/forgot', validate(forgotSchema), ForgotPassword);
router.post('/reset/:id', resetCheck, validate(resetSchema), ResetPassword);
router.get('/me', isAuth, getLoggedInUser);

// router.get('/getUsers', getUsers);

export const AuthRoutes = router;
