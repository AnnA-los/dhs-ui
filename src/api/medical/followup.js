import request from '@/utils/request'

export function listFollowup(query) {
  return request({ url: '/medical/followup/list', method: 'get', params: query })
}

export function getFollowup(followupId) {
  return request({ url: '/medical/followup/' + followupId, method: 'get' })
}

export function addFollowup(data) {
  return request({ url: '/medical/followup', method: 'post', data: data })
}

export function updateFollowup(data) {
  return request({ url: '/medical/followup', method: 'put', data: data })
}

export function delFollowup(followupId) {
  return request({ url: '/medical/followup/' + followupId, method: 'delete' })
}
