import request from '@/utils/request'

export function listSmsChannel(query) {
  return request({ url: '/system/sms/channel/list', method: 'get', params: query })
}

export function getSmsChannel(channelId) {
  return request({ url: '/system/sms/channel/' + channelId, method: 'get' })
}

export function addSmsChannel(data) {
  return request({ url: '/system/sms/channel', method: 'post', data: data })
}

export function updateSmsChannel(data) {
  return request({ url: '/system/sms/channel', method: 'put', data: data })
}

export function delSmsChannel(channelId) {
  return request({ url: '/system/sms/channel/' + channelId, method: 'delete' })
}

export function listSmsTemplate(query) {
  return request({ url: '/system/sms/template/list', method: 'get', params: query })
}

export function getSmsTemplate(templateId) {
  return request({ url: '/system/sms/template/' + templateId, method: 'get' })
}

export function addSmsTemplate(data) {
  return request({ url: '/system/sms/template', method: 'post', data: data })
}

export function updateSmsTemplate(data) {
  return request({ url: '/system/sms/template', method: 'put', data: data })
}

export function delSmsTemplate(templateId) {
  return request({ url: '/system/sms/template/' + templateId, method: 'delete' })
}

export function listSmsSceneTemplate(query) {
  return request({ url: '/system/sms/scene-template/list', method: 'get', params: query })
}

export function getSmsSceneTemplate(relationId) {
  return request({ url: '/system/sms/scene-template/' + relationId, method: 'get' })
}

export function addSmsSceneTemplate(data) {
  return request({ url: '/system/sms/scene-template', method: 'post', data: data })
}

export function updateSmsSceneTemplate(data) {
  return request({ url: '/system/sms/scene-template', method: 'put', data: data })
}

export function delSmsSceneTemplate(relationId) {
  return request({ url: '/system/sms/scene-template/' + relationId, method: 'delete' })
}

export function listSmsSendLog(query) {
  return request({ url: '/system/sms/send-log/list', method: 'get', params: query })
}
