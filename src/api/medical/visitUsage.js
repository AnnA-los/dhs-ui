import request from '@/utils/request'

export function listVisitUsage(query) {
  return request({ url: '/medical/visit/usage/list', method: 'get', params: query })
}

export function getVisitUsage(usageId) {
  return request({ url: '/medical/visit/usage/' + usageId, method: 'get' })
}

export function addVisitUsage(data) {
  return request({ url: '/medical/visit/usage', method: 'post', data: data })
}

export function updateVisitUsage(data) {
  return request({ url: '/medical/visit/usage', method: 'put', data: data })
}

export function delVisitUsage(usageId) {
  return request({ url: '/medical/visit/usage/' + usageId, method: 'delete' })
}
