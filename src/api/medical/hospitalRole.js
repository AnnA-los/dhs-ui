import request from '@/utils/request'

export function listHospitalRole(query) {
  return request({ url: '/medical/hospital/role/list', method: 'get', params: query })
}

export function getHospitalRole(roleId) {
  return request({ url: '/medical/hospital/role/' + roleId, method: 'get' })
}

export function addHospitalRole(data) {
  return request({ url: '/medical/hospital/role', method: 'post', data: data })
}

export function updateHospitalRole(data) {
  return request({ url: '/medical/hospital/role', method: 'put', data: data })
}

export function delHospitalRole(roleId) {
  return request({ url: '/medical/hospital/role/' + roleId, method: 'delete' })
}
