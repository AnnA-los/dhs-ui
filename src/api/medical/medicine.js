import request from '@/utils/request'

export function listMedicine(query) {
  return request({ url: '/medical/medicine/list', method: 'get', params: query })
}

export function medicineOptions(query) {
  return request({ url: '/medical/medicine/options', method: 'get', params: query })
}

export function getMedicine(medicineId) {
  return request({ url: '/medical/medicine/' + medicineId, method: 'get' })
}

export function addMedicine(data) {
  return request({ url: '/medical/medicine', method: 'post', data: data })
}

export function updateMedicine(data) {
  return request({ url: '/medical/medicine', method: 'put', data: data })
}

export function delMedicine(medicineId) {
  return request({ url: '/medical/medicine/' + medicineId, method: 'delete' })
}
