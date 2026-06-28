import request from '@/utils/request'

export function listSchedule(query) {
  return request({ url: '/medical/schedule/list', method: 'get', params: query })
}

export function getSchedule(scheduleId) {
  return request({ url: '/medical/schedule/' + scheduleId, method: 'get' })
}

export function addSchedule(data) {
  return request({ url: '/medical/schedule', method: 'post', data: data })
}

export function updateSchedule(data) {
  return request({ url: '/medical/schedule', method: 'put', data: data })
}

export function delSchedule(scheduleId) {
  return request({ url: '/medical/schedule/' + scheduleId, method: 'delete' })
}

export function getScheduleBusinessHours() {
  return request({ url: '/medical/schedule/business-hours/current', method: 'get' })
}

export function saveScheduleBusinessHours(data) {
  return request({
    url: '/medical/schedule/business-hours',
    method: data && data.businessHoursId ? 'put' : 'post',
    data: data
  })
}
