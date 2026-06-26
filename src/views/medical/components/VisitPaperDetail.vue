<template>
  <div class="visit-paper">
    <div class="paper-header">
      <div>
        <div class="paper-title">接诊病历</div>
        <div class="paper-subtitle">病历编号：{{ visit.visitNo || '-' }}</div>
      </div>
      <el-tag size="small" effect="plain">{{ recordStatusName(visit.recordStatus) }}</el-tag>
    </div>
    <div class="paper-grid">
      <div class="paper-cell">
        <span>患者</span>
        <strong>{{ visit.patientName || '-' }}</strong>
      </div>
      <div class="paper-cell">
        <span>医生</span>
        <strong>{{ visit.doctorName || '-' }}</strong>
      </div>
      <div class="paper-cell">
        <span>病历类型</span>
        <strong>{{ visit.visitTypeName || '-' }}</strong>
      </div>
      <div class="paper-cell">
        <span>接诊时间</span>
        <strong>{{ parseTime(visit.visitTime) || '-' }}</strong>
      </div>
    </div>
    <div class="paper-section">
      <div class="section-title">主诉</div>
      <div class="section-content">{{ visit.chiefComplaint || '-' }}</div>
    </div>
    <div class="paper-section">
      <div class="section-title">诊断</div>
      <div class="section-content">{{ visit.diagnosis || '-' }}</div>
    </div>
    <div class="paper-section">
      <div class="section-title">治疗计划</div>
      <div class="section-content">{{ visit.treatmentPlan || '-' }}</div>
    </div>
    <div class="paper-section">
      <div class="section-title">备注</div>
      <div class="section-content">{{ visit.remark || '-' }}</div>
    </div>
    <div v-if="imageList.length" class="paper-section">
      <div class="section-title">影像资料</div>
      <div class="image-list">
        <image-preview v-for="url in imageList" :key="url" :src="url" :width="72" :height="72" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VisitPaperDetail',
  props: {
    visit: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    imageList() {
      return (this.visit.imageUrls || '').split(',').filter(Boolean)
    }
  },
  methods: {
    recordStatusName(status) {
      return { '0': '草稿', '1': '已提交' }[status] || status || '-'
    }
  }
}
</script>

<style scoped>
.visit-paper {
  min-height: 520px;
  padding: 28px 34px;
  color: #303133;
  background: #fffdfa;
  border: 1px solid #eadfce;
  box-shadow: inset 0 0 0 1px rgba(234, 223, 206, 0.35);
}
.paper-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 2px solid #303133;
}
.paper-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
}
.paper-subtitle {
  margin-top: 6px;
  color: #606266;
  font-size: 13px;
}
.paper-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-left: 1px solid #dcdfe6;
  border-top: 1px solid #dcdfe6;
}
.paper-cell {
  display: flex;
  min-height: 46px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
}
.paper-cell span {
  width: 86px;
  padding: 13px 12px;
  color: #606266;
  background: #f7f3ed;
}
.paper-cell strong {
  flex: 1;
  padding: 13px 12px;
  font-weight: 500;
  word-break: break-word;
}
.paper-section {
  margin-top: 18px;
}
.section-title {
  margin-bottom: 8px;
  font-weight: 700;
}
.section-content {
  min-height: 64px;
  padding: 12px;
  line-height: 22px;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid #dcdfe6;
  background: rgba(255, 255, 255, 0.72);
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
