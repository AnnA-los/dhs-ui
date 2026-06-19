<template>
  <el-card shadow="never" class="report-chart-card">
    <div slot="header" class="report-chart-header">
      <span>{{ title }}</span>
      <span class="report-chart-unit">{{ metric === 'quantity' ? '数量' : '金额' }}</span>
    </div>
    <div ref="chart" class="report-chart"></div>
  </el-card>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'ReportChart',
  props: {
    title: { type: String, required: true },
    rows: { type: Array, default: () => [] },
    chartType: { type: String, default: 'bar' },
    pieMode: { type: String, default: 'category' },
    metric: { type: String, default: 'amount' }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    rows: {
      handler() {
        this.renderChart()
      },
      deep: true
    },
    chartType() {
      this.renderChart()
    },
    pieMode() {
      this.renderChart()
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    resizeChart() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    metricValue(row) {
      return Number((this.metric === 'quantity' ? row.quantity : row.amount) || 0)
    },
    axisRows() {
      const times = []
      const names = []
      const grouped = {}
      ;(this.rows || []).forEach(row => {
        const time = row.statTime || '未分组'
        const name = row.statName || this.title || '统计值'
        if (times.indexOf(time) === -1) {
          times.push(time)
        }
        if (names.indexOf(name) === -1) {
          names.push(name)
        }
        if (!grouped[name]) {
          grouped[name] = {}
        }
        grouped[name][time] = (grouped[name][time] || 0) + this.metricValue(row)
      })
      times.sort()
      return {
        times,
        series: names.map(name => ({
          name,
          data: times.map(time => grouped[name][time] || 0)
        }))
      }
    },
    pieRows() {
      const grouped = {}
      ;(this.rows || []).forEach(row => {
        const name = this.pieMode === 'time' ? (row.statTime || '未分组') : (row.statName || row.statTime || '未分组')
        grouped[name] = (grouped[name] || 0) + this.metricValue(row)
      })
      return Object.keys(grouped).map(name => ({ name, value: grouped[name] }))
    },
    axisTooltip(params) {
      const items = (params || []).filter(item => Number(item.value || 0) > 0)
      if (!items.length) {
        return params && params.length ? params[0].axisValue : ''
      }
      const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0)
      const lines = [`${items[0].axisValue} 合计：${total}`]
      items.forEach(item => {
        lines.push(`${item.marker}${item.seriesName}：${item.value}`)
      })
      return lines.join('<br/>')
    },
    emptyOption() {
      return {
        graphic: {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: '暂无数据',
            fill: '#909399',
            fontSize: 14
          }
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: []
      }
    },
    renderChart() {
      if (!this.chart) {
        return
      }
      const rows = this.chartType === 'pie' ? this.pieRows() : this.axisRows()
      if (this.chartType === 'pie' ? !rows.length : !rows.times.length) {
        this.chart.setOption(this.emptyOption(), true)
        return
      }
      const baseOption = {
        color: ['#4C7EFF', '#28A745', '#F59F00', '#E8590C', '#7950F2', '#15AABF', '#E64980'],
        tooltip: {
          trigger: this.chartType === 'pie' ? 'item' : 'axis',
          axisPointer: this.chartType === 'bar' ? { type: 'shadow' } : { type: 'line' },
          formatter: this.chartType === 'pie' ? undefined : this.axisTooltip
        },
        grid: { left: 42, right: 24, top: 36, bottom: 54, containLabel: true }
      }
      if (this.chartType === 'pie') {
        this.chart.setOption({
          ...baseOption,
          legend: { type: 'scroll', bottom: 0 },
          series: [{
            name: this.title,
            type: 'pie',
            radius: '64%',
            center: ['50%', '44%'],
            avoidLabelOverlap: true,
            label: {
              formatter: params => `${params.name}: ${params.percent}%`
            },
            data: rows
          }]
        }, true)
        return
      }
      const type = this.chartType === 'line' ? 'line' : 'bar'
      this.chart.setOption({
        ...baseOption,
        xAxis: {
          type: 'category',
          data: rows.times,
          axisLabel: { interval: 0, rotate: rows.times.length > 5 ? 28 : 0 }
        },
        yAxis: { type: 'value' },
        legend: rows.series.length > 1 ? { type: 'scroll', top: 0, right: 12 } : undefined,
        series: rows.series.map(item => ({
          name: item.name,
          type,
          smooth: type === 'line',
          stack: type === 'bar' ? 'total' : undefined,
          barMaxWidth: 38,
          emphasis: type === 'bar' ? { focus: 'series' } : undefined,
          data: item.data
        }))
      }, true)
    }
  }
}
</script>

<style scoped>
.report-chart-card {
  margin-bottom: 16px;
  border-radius: 6px;
}

.report-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.report-chart-unit {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.report-chart {
  width: 100%;
  height: 320px;
}
</style>
