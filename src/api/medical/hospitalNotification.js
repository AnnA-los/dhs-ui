import request from '@/utils/request'

export function mineHospitalNotifications() {
  return request({ url: '/medical/hospital/notification/mine', method: 'get' })
}

export function readHospitalNotification(notificationId) {
  return request({ url: '/medical/hospital/notification/' + notificationId + '/read', method: 'put' })
}
