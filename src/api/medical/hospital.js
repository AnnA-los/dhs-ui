import request from '@/utils/request'

export function getCurrentHospital() {
  return request({
    url: '/medical/hospital/current',
    method: 'get'
  })
}

export function listMyHospitals() {
  return request({
    url: '/medical/hospital/my',
    method: 'get'
  })
}

export function listLoginHospitals() {
  return request({
    url: '/medical/hospital/login-options',
    method: 'get'
  })
}

export function selectLoginHospital(hospitalUserId) {
  return request({
    url: '/medical/hospital/select-login/' + hospitalUserId,
    method: 'post'
  })
}

export function switchHospital(hospitalUserId) {
  return request({
    url: '/medical/hospital/switch/' + hospitalUserId,
    method: 'post'
  })
}

export function updateHospital(data) {
  return request({
    url: '/medical/hospital',
    method: 'put',
    data: data
  })
}

export function transferOwner(data) {
  return request({
    url: '/medical/hospital/owner/transfer',
    method: 'post',
    data: data
  })
}

export function transferOwnerByPhone(data) {
  return request({
    url: '/medical/hospital/owner/transfer-phone',
    method: 'post',
    data: data
  })
}
