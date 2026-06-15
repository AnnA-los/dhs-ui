import request from '@/utils/request'

export function listHospitalUser(query) {
  return request({ url: '/medical/hospital/user/list', method: 'get', params: query })
}

export function getHospitalUser(hospitalUserId) {
  return request({ url: '/medical/hospital/user/' + hospitalUserId, method: 'get' })
}

export function addHospitalUser(data) {
  return request({ url: '/medical/hospital/user', method: 'post', data: data })
}

export function updateHospitalUser(data) {
  return request({ url: '/medical/hospital/user', method: 'put', data: data })
}

export function delHospitalUser(hospitalUserId) {
  return request({ url: '/medical/hospital/user/' + hospitalUserId, method: 'delete' })
}

export function assignHospitalUserRoles(hospitalUserId, data) {
  return request({ url: '/medical/hospital/user/' + hospitalUserId + '/roles', method: 'put', data: data })
}
