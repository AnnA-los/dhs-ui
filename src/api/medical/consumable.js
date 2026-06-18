import request from '@/utils/request'

export function listConsumable(query) {
  return request({ url: '/medical/consumable/list', method: 'get', params: query })
}

export function consumableOptions(query) {
  return request({ url: '/medical/consumable/options', method: 'get', params: query })
}

export function getConsumable(consumableId) {
  return request({ url: '/medical/consumable/' + consumableId, method: 'get' })
}

export function addConsumable(data) {
  return request({ url: '/medical/consumable', method: 'post', data: data })
}

export function updateConsumable(data) {
  return request({ url: '/medical/consumable', method: 'put', data: data })
}

export function delConsumable(consumableId) {
  return request({ url: '/medical/consumable/' + consumableId, method: 'delete' })
}
