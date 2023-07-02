
import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../../models/types'
import { Chat, ChatDocument } from '../../models/chat.model'
import { User } from '../../models/user.model'

export async function createChat (req: AuthenticatedRequest, res: Response) {
      const { userId } = req.body

      if (!userId) {
            console.log('No user id send to server')
            return res.status(400).json({ message: 'No user id send to server' })
      }

      const user = await User.findById(userId)

      const isChat: ChatDocument[] = await Chat.find({
            isGroupChat: false,
            $and: [
                  { users: { $elemMatch: { $eq: req.user._id } } },
                  { users: { $elemMatch: { $eq: userId } } },
            ],
      })
            .populate("users", "-password")
            .populate("latestMessage");

      // isChat = await User.populate(isChat, {
      //       path: "latestMessage.sender",
      //       select: "name pic email",
      // });

      if (isChat.length > 0) {
            return res.status(200).json(isChat[0])
      } else {
            let chatData = {
                  chatName: user.username,
                  isGroupChat: false,
                  users: [req.user?._id, userId]
            }

            try {
                  const createdChat = await Chat.create(chatData)
                  const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', "-password")

                  res.status(200).send(FullChat)
            } catch (error) {
                  throw new Error(error.message)
            }
      }
}

export async function getChats (req: AuthenticatedRequest, res: Response) {
      try {
            Chat.find({ users: { $elemMatch: { $eq: req.user?._id } } })
                  .populate("users", "-password")
                  .populate("groupAdmin", "-password")
                  .populate("latestMessage")
                  .sort({ updatedAt: -1 })
                  .then(async (result) => {
                        await User.populate(result, {
                              path: "latestMessage.sender",
                              select: "username profileImg email",
                        })
                        res.status(200).send(result);
                  })

      } catch (error) {
            throw new Error(error.message)
      }
}

export async function getUserChats(req: AuthenticatedRequest, res: Response) {
      const { userId } = req.params;
    
      if (!userId) {
        console.log('No user id sent to the server');
        return res.status(400).json({ message: 'No user id sent to the server' });
      }
    
      try {
        const result = await Chat.find({
          $and: [
            { users: { $elemMatch: { $eq: req.user?._id } } },
            { users: { $elemMatch: { $eq: userId } } },
          ],
        })
          .populate('users', '-password')
          .populate('groupAdmin', '-password')
          .populate({
            path: 'latestMessage',
            populate: {
              path: 'sender',
              select: 'username profileImg email',
            },
          })
         
        res.status(200).send(result);
      } catch (error) {
        throw new Error(error.message);
      }
    }
    

export async function createGroupChat (req: AuthenticatedRequest, res: Response) {
      const { users, chatName, groupImage } = req.body

      if (!users || !chatName) {
            console.log('No user ids or chat name sent to server')
            return res.status(400).json({ message: 'Please fill all the fields' })
      }

      users.push(req.user?._id)

      try {
            const groupChatData = {
                  chatName,
                  isGroupChat: true,
                  users,
                  groupAdmin: req.user?._id,
                  groupImage: groupImage || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
            }

            const createdChat = await Chat.create(groupChatData)
            const FullChat = await Chat.findOne({ _id: createdChat._id })
                  .populate('users', "-password").populate('groupAdmin', "-password")


            res.status(200).send(FullChat)
      } catch (error) {
            throw new Error(error.message)
      }
}

export async function renameGroupChat (req: AuthenticatedRequest, res: Response) {
      const { chatId, groupName } = req.body
      console.log('chatId', chatId, 'groupName', groupName)

      if (!chatId || !groupName) {
            console.log('No chat id or chat name sent to server')
            return res.status(400).json({ message: 'Please fill all the fields' })
      }

      await Chat.findByIdAndUpdate(chatId, { groupName }, { new: true }).populate('users', "-password").populate('groupAdmin', "-password")

      return res.status(200).send(groupName)
}

export async function updateGroupImage (req: AuthenticatedRequest, res: Response) {
      const { chatId, groupImage } = req.body

      if (!chatId || !groupImage) {
            console.log('No chat id or group image sent to server')
            return res.status(400).json({ message: 'Please fill all the fields' })
      }

      await Chat.findByIdAndUpdate(chatId, { groupImage }, { new: true }).populate('users', "-password").populate('groupAdmin', "-password")

      return res.status(200).send(groupImage)
}

export async function addToGroupChat (req: AuthenticatedRequest, res: Response) {
      const { chatId, userId } = req.body

      if (!chatId || !userId) {
            console.log('No chat id or user id sent to server')
            return res.status(400).json({ message: 'Please fill all the fields' })
      }

      const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true }).populate('users', "-password").populate('groupAdmin', "-password")

      if (!added) {
            return res.status(400).json({ message: 'Could not add user' })
      } else {
            return res.status(200).send(added)
      }
}

export async function removeFromGroupChat (req: AuthenticatedRequest, res: Response) {
      const { chatId, userId } = req.body

      if (!chatId || !userId) {
            console.log('No chat id or user id sent to server')
            return res.status(400).json({ message: 'Please fill all the fields' })
      }

      const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true }).populate('users', "-password").populate('groupAdmin', "-password")

      if (!removed) {
            return res.status(400).json({ message: 'Could not remove user' })
      } else {
            return res.status(200).send(removed)
      }
}