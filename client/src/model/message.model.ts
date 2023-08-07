import { IChat } from "./chat.model"

export interface IMessage {
      count?: number
      _id: string
      chat: IChat
      content: string | File
      createdAt: string
      sender: {
            _id: string
            username: string
            profileImg: string
      }
      updatedAt: string,
      messageType: "text" | "image" | "audio" | "file"
      messageSize?: number
}

export interface UploadedFile {
      filename: string
      handle: string
      mimetype: string
      originalFile: {
            name: string
            type: string
            size: number
      }
      originalPath: string
      size: number
      source: string
      status: string
      uploadId: string
      url: string
}