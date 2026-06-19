import request from '@/utils/request'

export function listHospitalDept(query) {
  return request({ url: '/medical/hospital/dept/list', method: 'get', params: query })
}

export function hospitalDeptOptions(query) {
  return request({ url: '/medical/hospital/dept/options', method: 'get', params: query })
}

export function getHospitalDept(deptId) {
  return request({ url: '/medical/hospital/dept/' + deptId, method: 'get' })
}

export function addHospitalDept(data) {
  return request({ url: '/medical/hospital/dept', method: 'post', data: data })
}

export function updateHospitalDept(data) {
  return request({ url: '/medical/hospital/dept', method: 'put', data: data })
}

export function delHospitalDept(deptId) {
  return request({ url: '/medical/hospital/dept/' + deptId, method: 'delete' })
}
