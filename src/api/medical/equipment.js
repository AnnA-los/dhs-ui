import request from '@/utils/request'

export function listEquipment(query) {
  return request({ url: '/medical/equipment/list', method: 'get', params: query })
}

export function getEquipment(equipmentId) {
  return request({ url: '/medical/equipment/' + equipmentId, method: 'get' })
}

export function addEquipment(data) {
  return request({ url: '/medical/equipment', method: 'post', data: data })
}

export function updateEquipment(data) {
  return request({ url: '/medical/equipment', method: 'put', data: data })
}

export function delEquipment(equipmentId) {
  return request({ url: '/medical/equipment/' + equipmentId, method: 'delete' })
}
