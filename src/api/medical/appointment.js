import request from '@/utils/request'

// 查询预约列表
export function listAppointment(query) {
  return request({
    url: '/medical/appointment/list',
    method: 'get',
    params: query
  })
}

// 查询预约下拉选项
export function appointmentOptions(query) {
  return request({
    url: '/medical/appointment/options',
    method: 'get',
    params: query
  })
}

// 查询预约详细
export function getAppointment(appointmentId) {
  return request({
    url: '/medical/appointment/' + appointmentId,
    method: 'get'
  })
}

// 新增预约
export function addAppointment(data) {
  return request({
    url: '/medical/appointment',
    method: 'post',
    data: data
  })
}

// 修改预约
export function updateAppointment(data) {
  return request({
    url: '/medical/appointment',
    method: 'put',
    data: data
  })
}

// 删除预约
export function delAppointment(appointmentId) {
  return request({
    url: '/medical/appointment/' + appointmentId,
    method: 'delete'
  })
}
