import request from '@/utils/request'

export function getCurrentHospitalInvite() {
  return request({ url: '/medical/hospital/invite/current', method: 'get' })
}
