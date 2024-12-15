import request from '@/utils/request'

export interface LoginData {
  email: string
  password: string
}

export interface LoginRes {
  token: string
}

export interface Role {
  id: number
  createdAt: string
  updatedAt: string
  name: string
  value: string
  remark: string
  status: number
  default: boolean
}

export interface UserState {
  id: number
  createdAt: string
  updatedAt: string
  username: string
  nickname: string
  avatar: string
  qq: string
  email: string
  phone: string | null
  remark: string
  status: number
  roles: Role[]
}

export function login(data: LoginData): Promise<any> {
  return request.post<LoginRes>('/auth/login', data)
}

export function logout() {
  return request.post('/user/logout')
}

export function getUserInfo() {
  return request<UserState>('/account/profile')
}

export function getEmailCode(): Promise<any> {
  return request.get('/user/email-code')
}

export function resetPassword(): Promise<any> {
  return request.post('/user/reset-password')
}

export function register(): Promise<any> {
  return request.post('/user/register')
}
