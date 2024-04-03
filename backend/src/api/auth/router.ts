import express from 'express'
import { signUp, login, logoutUser, sendResetPasswordMail, resetPassword, validateUser } from './controller'
import upload from '@/middleware/multerMiddleware'

export const router = express.Router()

router.post('/signup', upload.single('profileImg'), signUp)
router.post('/login', login)
router.put('/logout', logoutUser)
router.post('/send-reset-password-mail', sendResetPasswordMail)
router.post('/reset-password', resetPassword)
router.get('/validate', validateUser)
