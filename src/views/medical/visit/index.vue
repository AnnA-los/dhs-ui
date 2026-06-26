<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="病历编号" prop="visitNo">
        <el-input v-model="queryParams.visitNo" placeholder="请输入病历编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="患者" prop="patientId">
        <el-select v-model="queryParams.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading">
          <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="医生" prop="doctorUserId">
        <el-select v-model="queryParams.doctorUserId" filterable remote clearable placeholder="请选择医生" :remote-method="remoteDoctors" :loading="doctorLoading">
          <el-option v-for="item in doctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="病历类型" prop="visitTypeId">
        <el-select v-model="queryParams.visitTypeId" filterable clearable placeholder="请选择病历类型">
          <el-option v-for="item in typeOptions" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="接诊时间">
        <el-date-picker v-model="visitTimeRange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="handleVisitTimeRangeChange" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen=true">病历类型</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="visitList" :height="tableHeight" border fit>
      <el-table-column label="病历编号" prop="visitNo" min-width="170" show-overflow-tooltip />
      <el-table-column label="患者" prop="patientName" min-width="130" show-overflow-tooltip />
      <el-table-column label="医生" prop="doctorName" min-width="130" show-overflow-tooltip />
      <el-table-column label="病历类型" prop="visitTypeName" min-width="120" show-overflow-tooltip />
      <el-table-column label="接诊时间" prop="visitTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.visitTime) }}</template>
      </el-table-column>
      <el-table-column label="主诉" prop="chiefComplaint" min-width="170" show-overflow-tooltip />
      <el-table-column label="诊断" prop="diagnosis" min-width="170" show-overflow-tooltip />
      <el-table-column label="状态" prop="recordStatus" width="90">
        <template slot-scope="scope">{{ recordStatusName(scope.row.recordStatus) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="210">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-document" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="患者" prop="patientName">
              <el-autocomplete
                v-model="form.patientName"
                clearable
                :disabled="isEdit"
                placeholder="请选择或输入患者"
                :fetch-suggestions="queryPatientSuggestions"
                style="width: 100%"
                @select="handlePatientSelect"
                @input="handlePatientInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生" prop="doctorUserId">
              <el-select v-model="form.doctorUserId" filterable remote clearable :disabled="isEdit" placeholder="请选择医生" :remote-method="remoteDoctors" :loading="doctorLoading" style="width: 100%">
                <el-option v-for="item in doctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="手机号" prop="patientPhone">
              <el-input v-model="form.patientPhone" :disabled="isEdit || !!form.patientId" clearable placeholder="新增患者时必填" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约编号" prop="appointmentId">
              <el-select v-model="form.appointmentId" filterable clearable placeholder="请选择预约编号" :disabled="!form.patientId" style="width: 100%">
                <el-option v-for="item in appointmentOptions" :key="item.appointmentId" :label="item.appointmentNo" :value="item.appointmentId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="病历类型" prop="visitTypeText">
              <el-autocomplete
                v-model="form.visitTypeText"
                clearable
                :disabled="isEdit"
                placeholder="请选择或输入病历类型"
                :fetch-suggestions="queryTypeSuggestions"
                style="width: 100%"
                @select="handleTypeSelect"
                @input="handleTypeInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接诊时间">
              <el-date-picker v-model="form.visitTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择接诊时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="主诉"><el-input v-model="form.chiefComplaint" type="textarea" /></el-form-item>
        <el-form-item label="诊断"><el-input v-model="form.diagnosis" type="textarea" /></el-form-item>
        <el-form-item label="治疗计划"><el-input v-model="form.treatmentPlan" type="textarea" /></el-form-item>
        <el-form-item label="影像资料"><image-upload v-model="form.imageUrls" :limit="5" /></el-form-item>
        <el-form-item label="病历状态">
          <el-select v-model="form.recordStatus" style="width: 220px">
            <el-option label="草稿" value="0" />
            <el-option label="已提交" value="1" />
          </el-select>
          <div class="form-tip">提交后会生成一笔收费单，可在收费管理查看。</div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button icon="el-icon-goods" @click="handleUsage(form)">收费明细</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="病历详情" :visible.sync="detailOpen" width="860px" append-to-body class="visit-detail-dialog">
      <visit-paper-detail :visit="detailVisit" />
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-goods" @click="handleReceipt(detailVisit)">收费明细</el-button>
        <el-button @click="detailOpen=false">关 闭</el-button>
      </div>
    </el-dialog>
    <el-dialog title="费用单据" :visible.sync="receiptOpen" width="760px" append-to-body class="receipt-dialog">
      <div class="receipt-paper">
        <div class="receipt-head">
          <div>
            <div class="receipt-title">费用单据</div>
            <div class="receipt-subtitle">病历编号：{{ receiptCharge.visitNo || '-' }}</div>
          </div>
          <div class="receipt-status">{{ receiptStatusName(receiptCharge.orderStatus) }}</div>
        </div>
        <div class="receipt-meta">
          <span>患者：{{ receiptCharge.patientName || '-' }}</span>
          <span>生成时间：{{ parseTime(receiptCharge.createTime) || '-' }}</span>
        </div>
        <el-table :data="receiptUsageList" border size="mini" class="receipt-table">
          <el-table-column label="类型" prop="itemType" width="90">
            <template slot-scope="scope">{{ itemTypeName(scope.row.itemType) }}</template>
          </el-table-column>
          <el-table-column label="名称" prop="itemName" min-width="160" show-overflow-tooltip />
          <el-table-column label="数量" prop="usedQuantity" width="90" />
          <el-table-column label="单价" prop="unitPrice" width="100">
            <template slot-scope="scope">{{ money(scope.row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="金额" prop="totalPrice" width="110">
            <template slot-scope="scope">{{ money(scope.row.totalPrice) }}</template>
          </el-table-column>
        </el-table>
        <div class="receipt-summary">
          <div><span>明细合计</span><b>{{ money(receiptUsageTotal) }}</b></div>
          <div><span>应收金额</span><b>{{ money(receiptCharge.totalAmount) }}</b></div>
          <div><span>折扣比例</span><b>{{ discountRateText(receiptCharge.discountRate) }}</b></div>
          <div><span>折扣金额</span><b>{{ money(receiptCharge.discountAmount) }}</b></div>
          <div class="actual"><span>实收金额</span><b>{{ money(receiptCharge.actualAmount) }}</b></div>
          <div><span>已收金额</span><b>{{ money(receiptCharge.paidAmount) }}</b></div>
          <div><span>退款金额</span><b>{{ money(receiptCharge.refundAmount) }}</b></div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="receiptOpen=false">关 闭</el-button>
      </div>
    </el-dialog>
    <type-manage-dialog v-model="typeOpen" title="病历类型" type-category="VISIT" @saved="loadTypes" />
  </div>
</template>

<script>
import { listVisit, getVisit, addVisit, updateVisit, delVisit } from '@/api/medical/visit'
import { patientOptions as queryPatients } from '@/api/medical/patient'
import { doctorOptions as queryDoctors } from '@/api/medical/hospitalUser'
import { medicalTypeOptions } from '@/api/medical/type'
import { appointmentOptions as queryAppointments, getAppointment } from '@/api/medical/appointment'
import { listCharge } from '@/api/medical/charge'
import { listVisitUsage } from '@/api/medical/visitUsage'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import VisitPaperDetail from '@/views/medical/components/VisitPaperDetail'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'

export default {
  name: 'MedicalVisit',
  components: { VisitPaperDetail, TypeManageDialog },
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      patientLoading: false,
      doctorLoading: false,
      total: 0,
      visitList: [],
      patientOptions: [],
      doctorOptions: [],
      appointmentOptions: [],
      typeOptions: [],
      visitTimeRange: this.getCurrentMonthTimeRange(),
      open: false,
      typeOpen: false,
      detailOpen: false,
      receiptOpen: false,
      detailVisit: {},
      receiptCharge: {},
      receiptUsageList: [],
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, visitNo: undefined, patientId: undefined, doctorUserId: undefined, visitTypeId: undefined, params: {} },
      form: {},
      rules: {
        patientName: [{ required: true, message: '患者不能为空', trigger: 'change' }],
        doctorUserId: [{ required: true, message: '医生不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.form.visitId
    },
    receiptUsageTotal() {
      return this.receiptUsageList.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    }
  },
  created() {
    this.getList()
    this.remotePatients('')
    this.remoteDoctors('')
    this.loadTypes()
    this.openFromAppointment()
  },
  watch: {
    '$route.query.appointmentId'() {
      this.openFromAppointment()
    }
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.params = {
        beginTime: this.visitTimeRange && this.visitTimeRange.length ? this.visitTimeRange[0] : undefined,
        endTime: this.visitTimeRange && this.visitTimeRange.length ? this.visitTimeRange[1] : undefined
      }
      listVisit(this.queryParams).then(r => {
        this.visitList = r.rows
        this.total = r.total
        this.loading = false
      })
    },
    loadTypes() {
      medicalTypeOptions({ typeCategory: 'VISIT' }).then(response => {
        this.typeOptions = response.data || []
      })
    },
    remotePatients(query) {
      this.patientLoading = true
      queryPatients({ patientName: query }).then(response => {
        this.patientOptions = response.data || []
        this.patientLoading = false
      })
    },
    queryPatientSuggestions(queryString, cb) {
      queryPatients({ patientName: queryString }).then(response => {
        const list = (response.data || []).map(item => ({
          value: item.patientName,
          patientId: item.patientId,
          patientName: item.patientName,
          patientPhone: item.phone
        }))
        cb(list)
      })
    },
    handlePatientSelect(item) {
      this.form.patientId = item.patientId
      this.form.patientName = item.patientName
      this.form.patientPhone = item.patientPhone
      this.loadAppointmentOptions()
    },
    handlePatientInput() {
      this.form.patientId = undefined
      this.form.appointmentId = undefined
      this.appointmentOptions = []
    },
    remoteDoctors(query) {
      this.doctorLoading = true
      queryDoctors({ nickName: query }).then(response => {
        this.doctorOptions = response.data || []
        this.doctorLoading = false
      })
    },
    reset() {
      this.form = { recordStatus: '0', imageUrls: undefined, appointmentId: undefined }
      this.appointmentOptions = []
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.visitTimeRange = this.getCurrentMonthTimeRange()
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleVisitTimeRangeChange(value) {
      this.visitTimeRange = this.restoreCurrentMonthRange(value, true)
      this.handleQuery()
    },
    queryTypeSuggestions(queryString, cb) {
      const keyword = (queryString || '').toLowerCase()
      cb(this.typeOptions
        .filter(item => !keyword || item.typeName.toLowerCase().includes(keyword))
        .map(item => ({ value: item.typeName, typeId: item.typeId })))
    },
    handleTypeSelect(item) {
      this.form.visitTypeId = item.typeId
      this.form.visitTypeText = item.value
    },
    handleTypeInput() {
      this.form.visitTypeId = undefined
    },
    handleAdd() {
      this.reset()
      this.title = '新增接诊病历'
      this.open = true
    },
    handleUpdate(row) {
      getVisit(row.visitId).then(r => {
        this.form = r.data
        this.form.visitTypeText = r.data.visitTypeName
        this.appointmentOptions = r.data.appointmentId ? [{ appointmentId: r.data.appointmentId, appointmentNo: r.data.appointmentNo }] : []
        this.title = '修改接诊病历'
        this.open = true
      })
    },
    handleDetail(row) {
      getVisit(row.visitId).then(r => {
        this.detailVisit = r.data
        this.detailOpen = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const req = this.form.visitId ? updateVisit(this.form) : addVisit(this.form)
        req.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
          this.loadTypes()
        })
      })
    },
    handleUsage(row) {
      if (!row.visitId) {
        this.$modal.msgWarning('请先保存病历')
        return
      }
      this.$router.push({ path: '/medical/visitUsage', query: { visitId: row.visitId }})
    },
    handleReceipt(row) {
      if (!row.visitId) {
        this.$modal.msgWarning('请先保存病历')
        return
      }
      listCharge({ visitId: row.visitId, pageNum: 1, pageSize: 1 }).then(response => {
        const charge = (response.rows || [])[0]
        if (!charge) {
          this.$modal.msgWarning('当前病历还没有收费单，请提交病历后查看')
          return Promise.reject(new Error('empty charge'))
        }
        this.receiptCharge = charge
        this.receiptOpen = true
        return listVisitUsage({ visitId: row.visitId, pageNum: 1, pageSize: 999 })
      }).then(response => {
        this.receiptUsageList = response.rows || []
      }).catch(() => {})
    },
    loadAppointmentOptions() {
      if (!this.form.patientId) {
        this.appointmentOptions = []
        return
      }
      queryAppointments({
        patientId: this.form.patientId,
        pageNum: 1,
        pageSize: 999,
        params: { beginTime: this.halfYearAgo(), endTime: this.nowTime() }
      }).then(response => {
        this.appointmentOptions = (response.data || []).filter(item => ['2', '4'].includes(String(item.appointmentStatus)))
      })
    },
    openFromAppointment() {
      const appointmentId = this.$route.query.appointmentId
      if (!appointmentId) {
        return
      }
      getAppointment(appointmentId).then(response => {
        const appointment = response.data || {}
        this.reset()
        this.form.patientId = appointment.patientId
        this.form.patientName = appointment.patientName
        this.form.patientPhone = appointment.patientPhone
        this.form.doctorUserId = appointment.doctorUserId
        this.form.visitTypeId = appointment.appointmentTypeId
        this.form.visitTypeText = appointment.appointmentTypeName
        this.form.appointmentId = appointment.appointmentId
        this.form.visitTime = appointment.appointmentStart
        this.appointmentOptions = [{ appointmentId: appointment.appointmentId, appointmentNo: appointment.appointmentNo }]
        this.title = '新增接诊病历'
        this.open = true
      })
    },
    halfYearAgo() {
      const date = new Date()
      date.setMonth(date.getMonth() - 6)
      return this.formatDateTime(date)
    },
    nowTime() {
      return this.formatDateTime(new Date())
    },
    formatDateTime(date) {
      const pad = n => String(n).padStart(2, '0')
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除接诊记录？').then(() => delVisit(row.visitId)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    recordStatusName(status) {
      return { '0': '草稿', '1': '已提交' }[status] || status
    },
    receiptStatusName(status) {
      return { '0': '待收费', '1': '部分收费', '2': '已收费', '3': '已退款', '4': '已作废', '5': '部分退款' }[status] || status
    },
    itemTypeName(type) {
      return { MEDICINE: '药品', CONSUMABLE: '耗材', PROJECT: '项目', OTHER: '其他' }[type] || type
    },
    discountRateText(value) {
      const rate = Number(value || 0)
      if (!rate) return '-'
      return (rate % 10 === 0 ? rate / 10 : rate) + '折'
    },
    money(value) {
      return Number(value || 0).toFixed(2)
    }
  }
}
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
  line-height: 18px;
}

.receipt-paper {
  padding: 24px 28px;
  color: #303133;
  background: #fffdf8;
  border: 1px solid #eadfca;
}

.receipt-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px dashed #d8c9ad;
}

.receipt-title {
  font-size: 22px;
  font-weight: 600;
  line-height: 30px;
}

.receipt-subtitle {
  margin-top: 4px;
  color: #606266;
}

.receipt-status {
  min-width: 72px;
  padding: 4px 10px;
  color: #fff;
  text-align: center;
  background: #409eff;
  border-radius: 4px;
}

.receipt-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin: 14px 0;
  color: #606266;
}

.receipt-table {
  margin-top: 10px;
}

.receipt-summary {
  width: 260px;
  margin: 18px 0 0 auto;
}

.receipt-summary div {
  display: flex;
  justify-content: space-between;
  line-height: 28px;
}

.receipt-summary .actual {
  margin-top: 8px;
  padding-top: 8px;
  font-size: 16px;
  border-top: 1px solid #d8c9ad;
}
</style>
