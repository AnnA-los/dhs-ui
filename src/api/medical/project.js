import request from '@/utils/request'

export function listProject(query) {
  return request({ url: '/medical/project/list', method: 'get', params: query })
}

export function projectOptions(query) {
  return request({ url: '/medical/project/options', method: 'get', params: query })
}

export function getProject(projectId) {
  return request({ url: '/medical/project/' + projectId, method: 'get' })
}

export function addProject(data) {
  return request({ url: '/medical/project', method: 'post', data: data })
}

export function updateProject(data) {
  return request({ url: '/medical/project', method: 'put', data: data })
}

export function delProject(projectId) {
  return request({ url: '/medical/project/' + projectId, method: 'delete' })
}
