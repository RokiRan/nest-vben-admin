import { defineStore } from 'pinia'
import type { LoginData, Role, UserState } from '@/api/user'
import { clearToken, setToken } from '@/utils/auth'

import {
  getEmailCode,
  getUserInfo,
  resetPassword,
  login as userLogin,
  logout as userLogout,
  register as userRegister,
} from '@/api/user'

const InitUserInfo = {
  id: 0,
  createdAt: '',
  updatedAt: '',
  username: '',
  nickname: '',
  avatar: '',
  qq: '',
  email: '',
  phone: null,
  remark: '',
  status: 0,
  roles: [] as Role[],
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserState>({ ...InitUserInfo })

  // Set user's information
  const setInfo = (partial: Partial<UserState>) => {
    userInfo.value = { ...InitUserInfo, ...partial }
  }

  const login = async (loginForm: LoginData) => {
    try {
      const { data } = await userLogin(loginForm)
      setToken(data.token)
    }
    catch (error) {
      clearToken()
      throw error
    }
  }

  const info = async () => {
    try {
      const { data } = await getUserInfo()
      setInfo(data)
    }
    catch (error) {
      clearToken()
      throw error
    }
  }

  const logout = async () => {
    try {
      await userLogout()
    }
    finally {
      clearToken()
      setInfo({ ...InitUserInfo })
    }
  }

  const getCode = async () => {
    try {
      const data = await getEmailCode()
      return data
    }
    catch {}
  }

  const reset = async () => {
    try {
      const data = await resetPassword()
      return data
    }
    catch {}
  }

  const register = async () => {
    try {
      const data = await userRegister()
      return data
    }
    catch {}
  }

  return {
    userInfo,
    info,
    login,
    logout,
    getCode,
    reset,
    register,
  }
}, {
  persist: true,
})

export default useUserStore
