/**
 * @module utils/ip
 * @description IP utility functions
 */
import type { IncomingMessage } from 'node:http'

import axios from 'axios'
import type { FastifyRequest } from 'fastify'

export function getIp(request: FastifyRequest | IncomingMessage) {
  const req = request as any

  let ip: string
    = request.headers['x-forwarded-for']
    || request.headers['X-Forwarded-For']
    || request.headers['X-Real-IP']
    || request.headers['x-real-ip']
    || req?.ip
    || req?.raw?.connection?.remoteAddress
    || req?.raw?.socket?.remoteAddress
    || undefined
  if (ip && ip.split(',').length > 0)
    ip = ip.split(',')[0]

  return ip
}

export async function getIpAddress(ip: string) {
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(ip)) return Promise.resolve('局域网')
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return Promise.resolve('局域网')
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(ip)) return Promise.resolve('局域网')
  if (/^127\.\d{1,3}$/.test(ip)) return Promise.resolve('本地')
  if (!ip || ip === '127.0.0.1') return Promise.resolve('本地')
  const { data } = await axios.get(
    `https://api.kuizuo.cn/api/ip-location?ip=${ip}&type=json`,
  )
  return data.addr
}
