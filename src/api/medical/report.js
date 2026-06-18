import request from '@/utils/request'

export function getReportSummary() {
  return request({ url: '/medical/report/summary', method: 'get' })
}

export function getReportStats(query) {
  return request({ url: '/medical/report/stats', method: 'get', params: query })
}
