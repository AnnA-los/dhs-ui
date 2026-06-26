<template>
  <div class="app-container report-page">
    <el-row :gutter="16" class="summary-row">
      <el-col v-for="item in cards" :key="item.label" :xs="12" :sm="8" :md="4">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <div class="report-toolbar">
      <div class="report-filter-group">
        <el-radio-group v-model="granularity" size="small" @change="getStats">
          <el-radio-button label="year">按年</el-radio-button>
          <el-radio-button label="month">按月</el-radio-button>
          <el-radio-button label="day">按天</el-radio-button>
          <el-radio-button label="hour">按小时</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dateRange"
          size="small"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          clearable
          @change="handleDateRangeChange"
        />
      </div>
      <el-radio-group v-model="chartType" size="small">
        <el-radio-button label="bar">柱状图</el-radio-button>
        <el-radio-button label="line">折线图</el-radio-button>
        <el-radio-button label="pie">扇形图</el-radio-button>
      </el-radio-group>
      <el-radio-group v-if="chartType === 'pie'" v-model="pieMode" size="small">
        <el-radio-button label="time">按时间</el-radio-button>
        <el-radio-button label="category">按分类</el-radio-button>
      </el-radio-group>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <report-chart title="采购成本" :rows="chartRows('purchaseCost')" :chart-type="chartType" :pie-mode="pieMode" metric="amount" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="收入" :rows="chartRows('income')" :chart-type="chartType" :pie-mode="pieMode" metric="amount" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="利润" :rows="chartRows('profit')" :chart-type="chartType" :pie-mode="pieMode" metric="amount" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="药品使用统计" :rows="chartRows('medicineUsage')" :chart-type="chartType" :pie-mode="pieMode" metric="quantity" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="耗材使用统计" :rows="chartRows('consumableUsage')" :chart-type="chartType" :pie-mode="pieMode" metric="quantity" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="项目统计" :rows="chartRows('projectUsage')" :chart-type="chartType" :pie-mode="pieMode" metric="quantity" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getReportSummary, getReportStats } from '@/api/medical/report'
import ReportChart from './components/ReportChart'

export default {
  name: 'MedicalReport',
  components: { ReportChart },
  data() {
    return {
      summary: {},
      granularity: 'day',
      chartType: 'bar',
      pieMode: 'category',
      dateRange: this.getCurrentMonthRange(),
      stats: {
        purchaseCost: [],
        purchaseCostCategory: [],
        income: [],
        incomeCategory: [],
        profit: [],
        medicineUsage: [],
        consumableUsage: [],
        projectUsage: []
      }
    }
  },
  computed: {
    cards() {
      return [
        { label: '患者数', value: this.summary.patientCount || 0 },
        { label: '预约数', value: this.summary.appointmentCount || 0 },
        { label: '接诊数', value: this.summary.visitCount || 0 },
        { label: '收费单', value: this.summary.chargeOrderCount || 0 },
        { label: '实收金额', value: this.summary.chargeAmount || 0 },
        { label: '库存预警', value: this.summary.stockWarningCount || 0 }
      ]
    }
  },
  created() {
    this.refreshReports()
  },
  methods: {
    dateQuery() {
      if (this.dateRange && this.dateRange.length === 2) {
        return {
          beginTime: this.dateRange[0],
          endTime: this.dateRange[1]
        }
      }
      return {}
    },
    refreshReports() {
      this.getSummary()
      this.getStats()
    },
    handleDateRangeChange(value) {
      this.dateRange = this.restoreCurrentMonthRange(value, false)
      this.refreshReports()
    },
    getSummary() {
      getReportSummary(this.dateQuery()).then(response => {
        this.summary = response.data || {}
      })
    },
    getStats() {
      const query = { granularity: this.granularity, ...this.dateQuery() }
      getReportStats(query).then(response => {
        this.stats = {
          purchaseCost: [],
          purchaseCostCategory: [],
          income: [],
          incomeCategory: [],
          profit: [],
          medicineUsage: [],
          consumableUsage: [],
          projectUsage: [],
          ...(response.data || {})
        }
      })
    },
    chartRows(key) {
      if (this.chartType !== 'pie' || this.pieMode !== 'category') {
        return this.stats[key] || []
      }
      if (key === 'purchaseCost') {
        return this.stats.purchaseCostCategory || []
      }
      if (key === 'income') {
        return this.stats.incomeCategory || []
      }
      return this.stats[key] || []
    }
  }
}
</script>

<style scoped>
.report-page {
  background: #f5f7fa;
}

.summary-row {
  margin-bottom: 18px;
}

.summary-card {
  margin-bottom: 12px;
  border-radius: 6px;
}

.summary-label {
  color: #606266;
  font-size: 13px;
}

.summary-value {
  margin-top: 10px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.report-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 16px;
}

.report-filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
