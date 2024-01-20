import { generateToken } from "../../config/generateToken.js"
import type { Response, Request } from "express"
import type { AuthenticatedRequest } from "../../models/types.js"
import { editUserDetailsService, editUserImageService, getUsersService, loginUser, resetPasswordConfirm, searchUsers, signUpUser } from "./service.js"
import { handleErrorService } from "../../middleware/errorMiddleware.js"
import { EmailService } from "../../services/email.service"
import logger from "../../services/logger.service.js"

export async function signUp(req: AuthenticatedRequest, res: Response) {
      const { username, email, password, profileImg } = req.body;

      try {
            const result = await signUpUser(username, email, password, profileImg);

            if (result.error) {
                  return res.status(400).json({ msg: result.error });
            }

            const { user } = result;

            if (user) {
                  const token = generateToken(user._id);

                  res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60 * 1000, 
                  });

                  return res.status(201).json({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        profileImg: user.profileImg,
                        about: user.about,
                        isOnline: true
                  });
            }

      } catch (error) {
            console.error('Error during sign up:', error);
            return res.status(500).json({ msg: 'Internal server error' });
      }
}


export async function login(req: AuthenticatedRequest, res: Response) {

      try {
            const { email, password } = req.body
            logger.info('Login request received with the following data:', { email, password })

            if (!email || !password) {
                  return res.status(400).json({ msg: 'Please enter all fields' })
            }

            const result = await loginUser(email, password)

            if (result.error) {
                  return res.status(401).json({ msg: result.error })
            }

            const { user } = result

            if (user) {

                  const token = generateToken(user._id)

                  res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 24 * 60 * 60 * 1000,
                  })
                  res.json({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        profileImg: user.profileImg,
                        about: user.about,
                        isOnline: true,
                  })
            } else {
                  throw new Error('User not found')
            }
      } catch (error: any) {
            logger.error('Error during login:', error)
            throw handleErrorService(error)
      }
}

export async function logoutUser(_: Request, res: Response) {
      try {
            res.cookie('token', '', {})
            res.status(200).json({ message: 'User logged out successfully' })
      } catch (error: any) {
            res.status(500).json({ error: 'Server error' })
      }
}

export async function sendResetPasswordMail(req: Request, res: Response) {
      const { email } = req.body
      try {
            const emailService = new EmailService()
            await emailService.sendResetPasswordMail(email)

            res.status(200).json({ message: 'Reset password email sent successfully' })
      } catch (error: any) {
            res.status(500).json({ error: 'Server error' })
      }
}

export async function resetPassword(req: Request, res: Response) {
      const { token, password } = req.body

      if (!token || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' })
      }

      try {
            await resetPasswordConfirm(token, password)
            res.status(200).json({ message: 'Password reset successfully' })
      } catch (error: any) {
            res.status(500).json({ error: 'Server error' })
      }
}

export async function searchUsersByKeyword(req: Request, res: Response) {
      const { search } = req.query
      const keyword = search?.toString() || ''

      try {
            const users = await searchUsers(keyword)
            res.send(users || [])
      } catch (error: any) {
            throw handleErrorService(error)
      }
}

export async function getUsers(req: AuthenticatedRequest, res: Response) {
      const loggedInUserId = req.user?._id

      try {
            const users = await getUsersService(loggedInUserId)
            res.send(users || [])
      } catch (error: any) {
            throw handleErrorService(error)
      }
}

export async function editUserDetails(req: AuthenticatedRequest, res: Response) {
      const { newName } = req.body
      const userId = req.user?._id

      try {
            const newNameToSave = newName?.replace(/[\/>]/g, '').trim()
            const user = await editUserDetailsService(userId, newNameToSave)

            if (user) {
                  res.send(user)
            } else {
                  res.status(404).json({ msg: 'User not found' })
            }
      } catch (error: any) {
            throw handleErrorService(error)
      }
}

export async function editUserImage(req: AuthenticatedRequest, res: Response) {
      const { image } = req.body
      const userId = req.user?._id

      try {
            const user = await editUserImageService(userId, image)

            if (user) {
                  res.send(user)
            } else {
                  res.status(404).json({ msg: 'User not found' })
            }
      } catch (error: any) {
            throw handleErrorService(error)
      }
}