import request from '@/utils/request'

export function listCustomWork(query) {
  return request({ url: '/medical/customWork/list', method: 'get', params: query })
}

export function customWorkOptions(query) {
  return request({ url: '/medical/customWork/options', method: 'get', params: query })
}

export function getCustomWork(customId) {
  return request({ url: '/medical/customWork/' + customId, method: 'get' })
}

export function addCustomWork(data) {
  return request({ url: '/medical/customWork', method: 'post', data: data })
}

export function updateCustomWork(data) {
  return request({ url: '/medical/customWork', method: 'put', data: data })
}

export function delCustomWork(customId) {
  return request({ url: '/medical/customWork/' + customId, method: 'delete' })
}
