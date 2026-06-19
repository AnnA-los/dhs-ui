import request from '@/utils/request'

export function getReportSummary(query) {
  return request({ url: '/medical/report/summary', method: 'get', params: query })
}

export function getReportStats(query) {
  return request({ url: '/medical/report/stats', method: 'get', params: query })
}
