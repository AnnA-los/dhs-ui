import request from '@/utils/request'

export function listInviteApply(query) {
  return request({ url: '/medical/hospital/invite/audit/list', method: 'get', params: query })
}

export function approveInviteApply(applyId, data) {
  return request({ url: '/medical/hospital/invite/audit/' + applyId + '/approve', method: 'put', data: data })
}

export function rejectInviteApply(applyId, data) {
  return request({ url: '/medical/hospital/invite/audit/' + applyId + '/reject', method: 'put', data: data })
}
