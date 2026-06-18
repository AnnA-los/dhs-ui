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
      return (this.rows || []).map(row => ({
        name: [row.statTime, row.statName].filter(Boolean).join(' / ') || '未分组',
        value: this.metricValue(row)
      }))
    },
    pieRows() {
      const grouped = {}
      ;(this.rows || []).forEach(row => {
        const name = row.statName || row.statTime || '未分组'
        grouped[name] = (grouped[name] || 0) + this.metricValue(row)
      })
      return Object.keys(grouped).map(name => ({ name, value: grouped[name] }))
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
      if (!rows.length) {
        this.chart.setOption(this.emptyOption(), true)
        return
      }
      const baseOption = {
        color: ['#4C7EFF', '#28A745', '#F59F00', '#E8590C', '#7950F2', '#15AABF', '#E64980'],
        tooltip: { trigger: this.chartType === 'pie' ? 'item' : 'axis' },
        grid: { left: 42, right: 24, top: 36, bottom: 54, containLabel: true }
      }
      if (this.chartType === 'pie') {
        this.chart.setOption({
          ...baseOption,
          legend: { type: 'scroll', bottom: 0 },
          series: [{
            name: this.title,
            type: 'pie',
            radius: ['38%', '64%'],
            center: ['50%', '44%'],
            avoidLabelOverlap: true,
            label: { formatter: '{b}: {d}%' },
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
          data: rows.map(item => item.name),
          axisLabel: { interval: 0, rotate: rows.length > 5 ? 28 : 0 }
        },
        yAxis: { type: 'value' },
        series: [{
          name: this.title,
          type,
          smooth: type === 'line',
          barMaxWidth: 38,
          data: rows.map(item => item.value)
        }]
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
