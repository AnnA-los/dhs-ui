import request from '@/utils/request'

export function cryptoStatus() {
  return request({ url: '/system/crypto/status', method: 'get' })
}

export function encryptValue(value) {
  return request({ url: '/system/crypto/encrypt', method: 'post', data: { value } })
}

export function decryptValue(value) {
  return request({ url: '/system/crypto/decrypt', method: 'post', data: { value } })
}

export function encryptApiValue(value) {
  return request({ url: '/system/crypto/api/encrypt', method: 'post', data: { value } })
}

export function decryptApiValue(value) {
  return request({ url: '/system/crypto/api/decrypt', method: 'post', data: { value } })
}
