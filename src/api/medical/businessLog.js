import request from '@/utils/request'

export function listBusinessLog(query) {
  return request({ url: '/medical/business/log/list', method: 'get', params: query })
}
