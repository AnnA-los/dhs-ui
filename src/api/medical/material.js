import request from '@/utils/request'

export function listMaterial(query) {
  return request({ url: '/medical/material/list', method: 'get', params: query })
}

export function getMaterial(materialId) {
  return request({ url: '/medical/material/' + materialId, method: 'get' })
}

export function addMaterial(data) {
  return request({ url: '/medical/material', method: 'post', data: data })
}

export function updateMaterial(data) {
  return request({ url: '/medical/material', method: 'put', data: data })
}

export function delMaterial(materialId) {
  return request({ url: '/medical/material/' + materialId, method: 'delete' })
}
