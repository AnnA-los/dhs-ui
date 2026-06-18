import request from '@/utils/request'

export function listCharge(query) {
  return request({ url: '/medical/charge/order/list', method: 'get', params: query })
}

export function getCharge(chargeOrderId) {
  return request({ url: '/medical/charge/order/' + chargeOrderId, method: 'get' })
}

export function addCharge(data) {
  return request({ url: '/medical/charge/order', method: 'post', data: data })
}

export function updateCharge(data) {
  return request({ url: '/medical/charge/order', method: 'put', data: data })
}
