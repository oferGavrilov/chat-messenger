import MessageList from './ChatList'
import { useState, useMemo, useEffect, useRef } from 'react'
import { chatService } from '../../../services/chat.service'
import useChat from '../../../store/useChat'
import ChatLoading from '../../SkeltonLoading'
import MessagesInput from '../../common/MessagesInput'
import { userService } from '../../../services/user.service'
import { AuthState } from '../../../context/useAuth'
import { IUser } from '../../../model/user.model'
import { IChat } from '../../../model/chat.model'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { useClickOutside } from '../../../custom/useClickOutside'
import socketService from '../../../services/socket.service'
import { ContentType } from '../../../pages/ChatPage'

interface MessagesProps {
      contentType: ContentType
}

export default function Chats ({ contentType }: MessagesProps) {

      const [isLoading, setIsLoading] = useState<boolean>(false)
      const [filter, setFilter] = useState<string>('')
      const [sort, setSort] = useState<'Newest' | 'Oldest' | null>(null)
      const [showSortModal, setShowSortModal] = useState<boolean>(false)

      const { chats, setChats } = useChat()
      const { user: loggedinUser } = AuthState()

      const modalRef = useRef<HTMLUListElement>(null)

      useClickOutside(modalRef, () => setShowSortModal(false), showSortModal)

      const filteredChats = useMemo(() => {
            if (filter) {
                  const filterRegex = new RegExp(filter, 'i')

                  return chats.filter((chat: IChat) => {
                        const includesUsername = chat.users?.some((user: IUser) => user._id !== loggedinUser?._id && filterRegex.test(user.username))
                        const includesGroupName = filterRegex.test(chat.chatName || '')

                        return includesUsername || includesGroupName
                  })
            }
            if (contentType === 'groups') {
                  return chats.filter((chat: IChat) => chat.isGroupChat)
            }
            if (sort) {
                  if (sort === 'Newest') {
                        return chats.sort((a: IChat, b: IChat) => new Date(b.updatedAt as string).getTime() - new Date(a.updatedAt as string).getTime())
                  }
                  else if (sort === 'Oldest') {
                        return chats.sort((a: IChat, b: IChat) => new Date(a.updatedAt as string).getTime() - new Date(b.updatedAt as string).getTime())
                  }
            }
            return chats
      }, [chats, filter, contentType, loggedinUser, sort, setChats])

      useEffect(() => {

            socketService.on('user-kicked', loadChats)
            socketService.on('user-joined', loadChats)
            socketService.on('user-left', loadChats)

            async function loadChats (): Promise<void> {
                  try {
                        setIsLoading(true)
                        const user = userService.getLoggedinUser()
                        if (!user) return
                        const chats = await chatService.getUserChats(user._id)
                        setChats(chats)

                  } catch (err) {
                        console.log(err)
                  } finally {
                        setIsLoading(false)
                  }
            }

            loadChats()

            return () => {
                  socketService.off('user-kicked')
                  socketService.off('user-joined')
                  socketService.off('user-left')
            }
      }, [])

      function onSetSort (type: 'Newest' | 'Oldest' | null) {
            setSort(type)
            setShowSortModal(false)
      }

      return (
            <div className="pt-4 relative h-full">
                  <MessagesInput filter={filter} setFilter={setFilter} />

                  <div className='p-3 mx-4 flex'>
                        Sort by
                        <div className='px-2 relative'>
                              <span className={`flex items-center text-primary font-semibold cursor-pointer hover:underline ${showSortModal && 'pointer-events-none'}`} onClick={() => setShowSortModal((prev) => !prev)}>
                                    {!sort ? 'None' : sort}
                                    <KeyboardArrowUpRoundedIcon fontSize='small' className={`!transition-transform duration-700 ${showSortModal ? 'rotate-180' : ''} `} />
                              </span>

                              <ul
                                    ref={modalRef}
                                    className={`sort-list ${showSortModal ? 'w-auto max-h-[300px]' : 'max-h-0 py-0'}`}
                              >
                                    <li className={`sort-option  ${sort === 'Newest' && 'sort-option-active'}`} onClick={() => onSetSort('Newest')}>Newest</li>
                                    <li className={`sort-option border-y dark:border-white ${sort === 'Oldest' && 'sort-option-active'}`} onClick={() => onSetSort('Oldest')}>Oldest</li>
                                    <li className={`sort-option ${!sort && 'sort-option-active'}`} onClick={() => onSetSort(null)}>None</li>
                              </ul>
                        </div>
                  </div>

                  {!isLoading ? (
                        <MessageList chats={filteredChats} />) : (
                        <ChatLoading type="chats" />)}
            </div>
      )
}
