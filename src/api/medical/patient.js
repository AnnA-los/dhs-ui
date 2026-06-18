import request from '@/utils/request'

// 查询患者档案列表
export function listPatient(query) {
  return request({
    url: '/medical/patient/list',
    method: 'get',
    params: query
  })
}

// 查询患者下拉选项
export function patientOptions(query) {
  return request({
    url: '/medical/patient/options',
    method: 'get',
    params: query
  })
}

// 查询患者档案详细
export function getPatient(patientId) {
  return request({
    url: '/medical/patient/' + patientId,
    method: 'get'
  })
}

// 新增患者档案
export function addPatient(data) {
  return request({
    url: '/medical/patient',
    method: 'post',
    data: data
  })
}

// 修改患者档案
export function updatePatient(data) {
  return request({
    url: '/medical/patient',
    method: 'put',
    data: data
  })
}

// 删除患者档案
export function delPatient(patientId) {
  return request({
    url: '/medical/patient/' + patientId,
    method: 'delete'
  })
}
