<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" class="charge-query">
      <el-form-item label="患者" prop="patientId">
        <el-select
          v-model="queryParams.patientId"
          filterable
          remote
          clearable
          placeholder="请选择患者"
          :remote-method="remotePatients"
          :loading="patientLoading"
          style="width: 180px"
        >
          <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="病历编号" prop="visitNo">
        <el-input v-model="queryParams.visitNo" clearable placeholder="请输入病历编号" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" clearable placeholder="请选择状态" style="width: 140px">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          style="width: 240px"
          @change="handleDateRangeChange"
        />
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
      <right-toolbar @queryTable="getList" />
    </el-row>

    <el-table v-loading="loading" :data="chargeList" :height="tableHeight" border fit>
      <el-table-column label="患者" prop="patientName" min-width="130" show-overflow-tooltip />
      <el-table-column label="病历编号" prop="visitNo" min-width="170" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button v-if="scope.row.visitId" type="text" size="mini" @click="handleReceipt(scope.row)">
            {{ scope.row.visitNo || scope.row.visitName }}
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="orderStatus" min-width="100">
        <template slot-scope="scope">
          <span class="charge-status-badge" :class="statusClass(scope.row.orderStatus)">{{ statusName(scope.row.orderStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付类型" prop="paymentTypes" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">
          <dict-tag :options="dict.type.medical_payment_type" :value="scope.row.paymentTypes" />
        </template>
      </el-table-column>
      <el-table-column label="应收" prop="totalAmount" min-width="100">
        <template slot-scope="scope">{{ money(scope.row.totalAmount) }}</template>
      </el-table-column>
      <el-table-column label="折扣比例" prop="discountRate" min-width="100">
        <template slot-scope="scope">{{ discountRateText(scope.row.discountRate) }}</template>
      </el-table-column>
      <el-table-column label="折扣金额" prop="discountAmount" min-width="100">
        <template slot-scope="scope">{{ money(scope.row.discountAmount) }}</template>
      </el-table-column>
      <el-table-column label="实收" prop="actualAmount" min-width="100">
        <template slot-scope="scope">{{ money(scope.row.actualAmount) }}</template>
      </el-table-column>
      <el-table-column label="已收" prop="paidAmount" min-width="100">
        <template slot-scope="scope">{{ money(scope.row.paidAmount) }}</template>
      </el-table-column>
      <el-table-column label="退款" prop="refundAmount" min-width="100">
        <template slot-scope="scope">{{ money(scope.row.refundAmount) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="160">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="580px" append-to-body>
      <el-form ref="form" :model="form" label-width="96px">
        <el-form-item label="患者">
          <el-select v-model="form.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading" style="width: 100%">
            <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
          </el-select>
        </el-form-item>
        <el-form-item label="病历编号">
          <el-select v-model="form.visitId" filterable remote clearable placeholder="请选择病历编号" :remote-method="remoteVisits" :loading="visitLoading" style="width: 100%">
            <el-option v-for="item in visitOptions" :key="item.visitId" :label="visitLabel(item)" :value="item.visitId" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付类型">
          <el-select v-model="paymentTypeValues" multiple clearable placeholder="请选择支付类型" style="width: 100%">
            <el-option v-for="dict in dict.type.medical_payment_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="应收金额">
          <el-input-number v-model="form.totalAmount" :precision="2" :min="0" @change="refreshActualAmount" />
        </el-form-item>
        <el-form-item label="折扣比例">
          <el-input-number v-model="form.discountRate" :min="0" :max="100" :step="1" step-strictly :precision="0" placeholder="请填1-100的整数" @change="handleDiscountRateChange" />
        </el-form-item>
        <el-form-item label="折扣金额">
          <el-input-number v-model="form.discountAmount" :precision="2" :min="0" @change="handleDiscountAmountChange" />
        </el-form-item>
        <el-form-item label="实收金额">
          <el-input :value="money(form.actualAmount)" disabled />
        </el-form-item>
        <el-form-item label="已收金额">
          <el-input-number v-model="form.paidAmount" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number v-model="form.refundAmount" :precision="2" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.orderStatus" style="width: 100%">
            <el-option v-if="form.orderStatus !== '4'" :label="statusName(form.orderStatus)" :value="form.orderStatus" disabled />
            <el-option label="已作废" value="4" />
          </el-select>
          <div class="form-tip">除已作废外，状态按已收、实收和退款金额自动计算。</div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="费用单据" :visible.sync="receiptOpen" width="760px" append-to-body class="receipt-dialog">
      <div class="receipt-paper">
        <div class="receipt-head">
          <div>
            <div class="receipt-title">费用单据</div>
            <div class="receipt-subtitle">病历编号：{{ receiptCharge.visitNo || '-' }}</div>
          </div>
          <div class="receipt-status charge-status-badge" :class="statusClass(receiptCharge.orderStatus)">{{ statusName(receiptCharge.orderStatus) }}</div>
        </div>
        <div class="receipt-meta">
          <span>患者：{{ receiptCharge.patientName || '-' }}</span>
          <span>支付类型：{{ paymentTypeText(receiptCharge.paymentTypes) || '-' }}</span>
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
        <el-button @click="receiptOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listCharge, getCharge, addCharge, updateCharge } from '@/api/medical/charge'
import { patientOptions as queryPatients } from '@/api/medical/patient'
import { visitOptions as queryVisits } from '@/api/medical/visit'
import { listVisitUsage } from '@/api/medical/visitUsage'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalCharge',
  dicts: ['medical_payment_type'],
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      patientLoading: false,
      visitLoading: false,
      total: 0,
      chargeList: [],
      patientOptions: [],
      visitOptions: [],
      dateRange: this.getCurrentMonthRange(),
      open: false,
      receiptOpen: false,
      receiptCharge: {},
      receiptUsageList: [],
      paymentTypeValues: [],
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, patientId: undefined, visitNo: undefined, orderStatus: undefined },
      form: {},
      statusOptions: [
        { label: '待收费', value: '0' },
        { label: '部分收费', value: '1' },
        { label: '已收费', value: '2' },
        { label: '已退款', value: '3' },
        { label: '已作废', value: '4' },
        { label: '部分退款', value: '5' }
      ],
      itemTypeOptions: [
        { label: '药品', value: 'MEDICINE' },
        { label: '耗材', value: 'CONSUMABLE' },
        { label: '项目', value: 'PROJECT' },
        { label: '其他', value: 'OTHER' }
      ]
    }
  },
  computed: {
    receiptUsageTotal() {
      return this.receiptUsageList.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
    }
  },
  created() {
    this.getList()
    this.remotePatients('')
    this.remoteVisits('')
  },
  methods: {
    getList() {
      this.loading = true
      listCharge(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.chargeList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = this.getCurrentMonthRange()
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDateRangeChange(value) {
      this.dateRange = this.restoreCurrentMonthRange(value, false)
      this.handleQuery()
    },
    remotePatients(query) {
      this.patientLoading = true
      queryPatients({ patientName: query }).then(response => {
        this.patientOptions = response.data || []
        this.patientLoading = false
      })
    },
    remoteVisits(query) {
      this.visitLoading = true
      queryVisits({ visitNo: query }).then(response => {
        this.visitOptions = response.data || []
        this.visitLoading = false
      })
    },
    reset() {
      this.form = { totalAmount: 0, discountAmount: 0, discountRate: 0, actualAmount: 0, paidAmount: 0, refundAmount: 0, orderStatus: '0', paymentTypes: '' }
      this.paymentTypeValues = []
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.title = '新增收费单'
      this.open = true
    },
    handleUpdate(row) {
      getCharge(row.chargeOrderId).then(response => {
        this.form = response.data || {}
        this.paymentTypeValues = this.splitPaymentTypes(this.form.paymentTypes)
        this.refreshActualAmount()
        this.title = '修改收费单'
        this.open = true
      })
    },
    submitForm() {
      if (!this.validatePaymentTypes()) {
        return
      }
      if (!this.validateDiscount()) {
        return
      }
      this.refreshActualAmount()
      if (Number(this.form.refundAmount || 0) > Number(this.form.paidAmount || 0)) {
        this.$modal.confirm('退款金额大于已收金额，是否确认提交？').then(() => this.doSubmitForm())
        return
      }
      this.doSubmitForm()
    },
    doSubmitForm() {
      const payload = { ...this.form, paymentTypes: this.paymentTypeValues.join(',') }
      const request = payload.chargeOrderId ? updateCharge(payload) : addCharge(payload)
      request.then(() => {
        this.$modal.msgSuccess('保存成功')
        this.open = false
        this.getList()
      })
    },
    handleReceipt(row) {
      getCharge(row.chargeOrderId).then(response => {
        this.receiptCharge = response.data || {}
        this.receiptOpen = true
        return listVisitUsage({ visitId: this.receiptCharge.visitId, pageNum: 1, pageSize: 999 })
      }).then(response => {
        this.receiptUsageList = response.rows || []
      })
    },
    handleDiscountRateChange(value) {
      if (Number(value || 0) > 0) {
        this.form.discountAmount = 0
      }
      this.refreshActualAmount()
    },
    handleDiscountAmountChange(value) {
      if (Number(value || 0) > 0) {
        this.form.discountRate = 0
      }
      this.refreshActualAmount()
    },
    refreshActualAmount() {
      const totalAmount = Number(this.form.totalAmount || 0)
      const discountRate = Number(this.form.discountRate || 0)
      const discountAmount = Number(this.form.discountAmount || 0)
      let actualAmount = totalAmount
      if (discountRate > 0) {
        actualAmount = totalAmount * discountRate / 100
      } else if (discountAmount > 0) {
        actualAmount = totalAmount - discountAmount
      }
      this.$set(this.form, 'actualAmount', Math.max(actualAmount, 0).toFixed(2))
    },
    validateDiscount() {
      const totalAmount = Number(this.form.totalAmount || 0)
      const discountRate = Number(this.form.discountRate || 0)
      const discountAmount = Number(this.form.discountAmount || 0)
      if (discountRate > 0 && discountAmount > 0) {
        this.$modal.msgWarning('折扣比例和折扣金额不能同时大于0')
        return false
      }
      if (discountRate < 0 || discountRate > 100 || !Number.isInteger(discountRate)) {
        this.$modal.msgWarning('折扣比例只能填写0到100的整数')
        return false
      }
      if (discountAmount > totalAmount) {
        this.$modal.msgWarning('折扣金额不能大于应收金额')
        return false
      }
      return true
    },
    validatePaymentTypes() {
      const paidAmount = Number(this.form.paidAmount || 0)
      const refundAmount = Number(this.form.refundAmount || 0)
      if (this.form.orderStatus !== '4' && (paidAmount > 0 || refundAmount > 0) && this.paymentTypeValues.length === 0) {
        this.$modal.msgWarning('当前收费状态必须选择支付类型')
        return false
      }
      return true
    },
    splitPaymentTypes(value) {
      return value ? String(value).split(',').filter(Boolean) : []
    },
    paymentTypeText(value) {
      return this.selectDictLabels(this.dict.type.medical_payment_type, value || '')
    },
    discountRateText(value) {
      const rate = Number(value || 0)
      if (!rate) {
        return '-'
      }
      return (rate % 10 === 0 ? rate / 10 : rate) + '折'
    },
    visitLabel(item) {
      return [item.visitNo, item.patientName, item.visitTime].filter(Boolean).join(' / ')
    },
    statusName(status) {
      const item = this.statusOptions.find(option => option.value === status)
      return item ? item.label : status
    },
    statusClass(status) {
      return {
        '0': 'status-pending',
        '1': 'status-partial',
        '2': 'status-paid',
        '3': 'status-refunded',
        '4': 'status-void',
        '5': 'status-partial-refund'
      }[status] || 'status-unknown'
    },
    itemTypeName(type) {
      const item = this.itemTypeOptions.find(option => option.value === type)
      return item ? item.label : type
    },
    money(value) {
      const amount = Number(value || 0)
      return amount.toFixed(2)
    }
  }
}
</script>

<style scoped>
.charge-query {
  margin-bottom: 10px;
}

.discount-line {
  display: flex;
  align-items: center;
}

.discount-suffix {
  margin-left: 8px;
  color: #606266;
}

.charge-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 24px;
  padding: 0 10px;
  color: #fff;
  font-size: 12px;
  line-height: 24px;
  border-radius: 4px;
}

.status-pending {
  background: #f56c6c;
}

.status-partial {
  background: #e6a23c;
}

.status-paid {
  background: #67c23a;
}

.status-refunded {
  background: #909399;
}

.status-partial-refund {
  background: #8b5cf6;
}

.status-void {
  background: #4b5563;
}

.status-unknown {
  background: #b1b3b8;
}

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
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
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
