import request from '@/utils/request'

export function getReportSummary() {
  return request({ url: '/medical/report/summary', method: 'get' })
}
