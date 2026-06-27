import request from '@/utils/request'

export function listSystemMessage(query) {
  return request({ url: '/medical/system/message/list', method: 'get', params: query })
}

export function getSystemMessage(messageId) {
  return request({ url: '/medical/system/message/' + messageId, method: 'get' })
}

export function addSystemMessage(data) {
  return request({ url: '/medical/system/message', method: 'post', data: data })
}

export function sendSystemMessage(data) {
  return request({ url: '/medical/system/message/send', method: 'post', data: data })
}

export function resendSystemMessage(messageId) {
  return request({ url: '/medical/system/message/' + messageId + '/send', method: 'put' })
}
