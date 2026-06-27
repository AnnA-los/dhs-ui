import request from '@/utils/request'

export function listInviteApply(query) {
  return request({ url: '/medical/hospital/invite/apply/list', method: 'get', params: query })
}

export function getInviteApply(applyId) {
  return request({ url: '/medical/hospital/invite/apply/' + applyId, method: 'get' })
}

export function approveInviteApply(applyId, data) {
  return request({ url: '/medical/hospital/invite/apply/' + applyId + '/approve', method: 'put', data: data })
}

export function rejectInviteApply(applyId, data) {
  return request({ url: '/medical/hospital/invite/apply/' + applyId + '/reject', method: 'put', data: data })
}
