import request from '@/utils/request'

export function getTodayMatches() {
  return request({
    url: '/football/matches/today',
    method: 'get'
  })
}

export function createBetOrder(data) {
  return request({
    url: '/orders/football',
    method: 'post',
    data
  })
} 