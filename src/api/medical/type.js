import request from '@/utils/request'

export function listMedicalType(query) {
  return request({ url: '/medical/type/list', method: 'get', params: query })
}

export function medicalTypeOptions(query) {
  return request({ url: '/medical/type/options', method: 'get', params: query })
}

export function getMedicalType(typeId) {
  return request({ url: '/medical/type/' + typeId, method: 'get' })
}

export function addMedicalType(data) {
  return request({ url: '/medical/type', method: 'post', data: data })
}

export function updateMedicalType(data) {
  return request({ url: '/medical/type', method: 'put', data: data })
}

export function delMedicalType(typeId) {
  return request({ url: '/medical/type/' + typeId, method: 'delete' })
}
