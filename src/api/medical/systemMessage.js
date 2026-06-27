import request from '@/utils/request'

export function listSystemMessage(query) {
  return request({ url: '/medical/system/message/list', method: 'get', params: query })
}

export function dispatchSystemMessage(data) {
  return request({ url: '/medical/system/message/dispatch', method: 'post', data: data })
}
