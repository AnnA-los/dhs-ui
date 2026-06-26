import request from '@/utils/request'

export function listHospitalPost(query) {
  return request({ url: '/medical/hospital/post/list', method: 'get', params: query })
}

export function hospitalPostOptions(query) {
  return request({ url: '/medical/hospital/post/options', method: 'get', params: query })
}

export function getHospitalPost(postId) {
  return request({ url: '/medical/hospital/post/' + postId, method: 'get' })
}

export function addHospitalPost(data) {
  return request({ url: '/medical/hospital/post', method: 'post', data: data })
}

export function updateHospitalPost(data) {
  return request({ url: '/medical/hospital/post', method: 'put', data: data })
}

export function delHospitalPost(postId) {
  return request({ url: '/medical/hospital/post/' + postId, method: 'delete' })
}
