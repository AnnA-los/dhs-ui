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
      <el-radio-group v-model="granularity" size="small" @change="getStats">
        <el-radio-button label="year">按年</el-radio-button>
        <el-radio-button label="month">按月</el-radio-button>
        <el-radio-button label="day">按天</el-radio-button>
        <el-radio-button label="hour">按小时</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="chartType" size="small">
        <el-radio-button label="bar">柱状图</el-radio-button>
        <el-radio-button label="line">折线图</el-radio-button>
        <el-radio-button label="pie">扇形图</el-radio-button>
      </el-radio-group>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <report-chart title="采购成本" :rows="stats.purchaseCost" :chart-type="chartType" metric="amount" />
      </el-col>
      <el-col :xs="24" :lg="12">
        <report-chart title="收入" :rows="stats.income" :chart-type="chartType" metric="amount" />
      </el-col>
      <el-col :xs="24" :lg="8">
        <report-chart title="药品使用统计" :rows="stats.medicineUsage" :chart-type="chartType" metric="quantity" />
      </el-col>
      <el-col :xs="24" :lg="8">
        <report-chart title="耗材使用统计" :rows="stats.consumableUsage" :chart-type="chartType" metric="quantity" />
      </el-col>
      <el-col :xs="24" :lg="8">
        <report-chart title="项目统计" :rows="stats.projectUsage" :chart-type="chartType" metric="quantity" />
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
      stats: {
        purchaseCost: [],
        income: [],
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
    this.getSummary()
    this.getStats()
  },
  methods: {
    getSummary() {
      getReportSummary().then(response => {
        this.summary = response.data || {}
      })
    },
    getStats() {
      getReportStats({ granularity: this.granularity }).then(response => {
        this.stats = {
          purchaseCost: [],
          income: [],
          medicineUsage: [],
          consumableUsage: [],
          projectUsage: [],
          ...(response.data || {})
        }
      })
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
  gap: 12px;
  margin: 0 0 16px;
}
</style>
