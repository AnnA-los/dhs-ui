import request from '@/utils/request'

export function listVisit(query) {
  return request({ url: '/medical/visit/list', method: 'get', params: query })
}

export function visitOptions(query) {
  return request({ url: '/medical/visit/options', method: 'get', params: query })
}

export function getVisit(visitId) {
  return request({ url: '/medical/visit/' + visitId, method: 'get' })
}

export function addVisit(data) {
  return request({ url: '/medical/visit', method: 'post', data: data })
}

export function updateVisit(data) {
  return request({ url: '/medical/visit', method: 'put', data: data })
}

export function delVisit(visitId) {
  return request({ url: '/medical/visit/' + visitId, method: 'delete' })
}
