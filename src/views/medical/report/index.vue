<template>
  <div class="app-container">
    <el-row :gutter="16">
      <el-col :span="4" v-for="item in cards" :key="item.label">
        <el-card shadow="never" class="summary-card">
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getReportSummary } from '@/api/medical/report'

export default {
  name: 'MedicalReport',
  data() {
    return {
      summary: {}
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
  },
  methods: {
    getSummary() {
      getReportSummary().then(response => {
        this.summary = response.data || {}
      })
    }
  }
}
</script>

<style scoped>
.summary-card {
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
</style>
