<template>
  <div class="app-container visit-usage-page">
    <el-row :gutter="10" class="mb8 usage-toolbar">
      <el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <el-col :span="1.5"><el-button icon="el-icon-back" size="mini" @click="$router.back()">返回</el-button></el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>
    <div ref="tablePanel" class="usage-table-panel">
      <el-table v-loading="loading" :data="usageList" :height="tableHeight" border fit>
        <el-table-column label="类型" prop="itemType" width="100"><template slot-scope="scope">{{ itemTypeName(scope.row.itemType) }}</template></el-table-column>
        <el-table-column label="名称" prop="itemName" min-width="180" show-overflow-tooltip />
        <el-table-column label="数量" prop="usedQuantity" width="90" />
        <el-table-column label="单价" prop="unitPrice" width="100" />
        <el-table-column label="总价" prop="totalPrice" width="110" />
        <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
      </el-table>
    </div>
    <div class="usage-footer">
      <div class="usage-total">明细总价：<strong>{{ totalPrice }}</strong></div>
      <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    </div>

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="明细类型"><el-radio-group v-model="form.itemType" @change="handleItemTypeChange"><el-radio label="MEDICINE">药品</el-radio><el-radio label="CONSUMABLE">耗材</el-radio><el-radio label="PROJECT">项目</el-radio><el-radio label="CUSTOM">加工定制</el-radio><el-radio label="OTHER">其他</el-radio></el-radio-group></el-form-item>
        <el-form-item v-if="selectManagedItem" label="物品">
          <el-select v-model="form.itemId" filterable remote clearable placeholder="请选择物品" :remote-method="remoteItems" :loading="itemLoading" style="width: 100%" @change="handleItemChange">
            <el-option v-for="item in itemOptions" :key="item.value" :label="item.label" :value="item.value">
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.itemType === 'OTHER'" label="名称"><el-input v-model="form.itemName" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="form.usedQuantity" :precision="0" :step="1" step-strictly :min="1" :max="showAvailable ? (currentAvailable || undefined) : undefined" @change="refreshTotal" /></el-form-item>
        <el-form-item label="单价"><el-input-number v-model="form.unitPrice" :disabled="selectManagedItem" :precision="2" :min="0" @change="refreshTotal" /></el-form-item>
        <el-form-item label="总价"><el-input-number v-model="form.totalPrice" :precision="2" disabled /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { listVisitUsage, getVisitUsage, addVisitUsage, updateVisitUsage, delVisitUsage } from '@/api/medical/visitUsage'
import { medicineOptions } from '@/api/medical/medicine'
import { consumableOptions } from '@/api/medical/consumable'
import { projectOptions } from '@/api/medical/project'
import { customWorkOptions } from '@/api/medical/customWork'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
export default {
  name: 'MedicalVisitUsage',
  mixins: [medicalTableHeight],
  data() {
    return { loading: true, itemLoading: false, total: 0, usageList: [], itemOptions: [], open: false, title: '', queryParams: { pageNum: 1, pageSize: 10, visitId: undefined }, form: {}, currentAvailable: 0 }
  },
  computed: {
    totalPrice() { return this.usageList.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0).toFixed(2) },
    showAvailable() { return this.form.itemType === 'MEDICINE' || this.form.itemType === 'CONSUMABLE' },
    selectManagedItem() { return this.form.itemType === 'MEDICINE' || this.form.itemType === 'CONSUMABLE' || this.form.itemType === 'PROJECT' || this.form.itemType === 'CUSTOM' }
  },
  created() {
    this.queryParams.visitId = this.$route.query.visitId
    this.getList()
  },
  methods: {
    getList() {
      if (!this.queryParams.visitId) {
        this.loading = false
        this.usageList = []
        this.total = 0
        return
      }
      this.loading = true
      listVisitUsage(this.queryParams).then(r => { this.usageList = r.rows; this.total = r.total; this.loading = false })
    },
    reset() { this.form = { visitId: this.queryParams.visitId, itemType: 'MEDICINE', itemId: undefined, itemName: undefined, usedQuantity: 1, unitPrice: 0, totalPrice: 0 }; this.currentAvailable = 0; this.itemOptions = [] },
    handleAdd() {
      if (!this.queryParams.visitId) {
        this.$modal.msgWarning('请先从接诊病历进入本页面')
        return
      }
      this.reset(); this.title = '新增收费明细'; this.open = true; this.remoteItems('')
    },
    handleUpdate(row) { getVisitUsage(row.usageId).then(r => { this.form = r.data; this.currentAvailable = this.showAvailable ? Number(r.data.availableQuantity || 0) + Number(r.data.usedQuantity || 0) : 0; this.title = '修改收费明细'; this.open = true; this.remoteItems('') }) },
    handleItemTypeChange() { this.form.itemId = undefined; this.form.itemName = undefined; this.form.unitPrice = 0; this.form.totalPrice = 0; this.currentAvailable = 0; this.itemOptions = []; if (this.selectManagedItem) this.remoteItems('') },
    remoteItems(query) {
      this.itemLoading = true
      if (!this.selectManagedItem) {
        this.itemLoading = false
        this.itemOptions = []
        return
      }
      const request = this.form.itemType === 'MEDICINE'
        ? medicineOptions({ medicineName: query })
        : (this.form.itemType === 'CONSUMABLE'
          ? consumableOptions({ consumableName: query })
          : (this.form.itemType === 'PROJECT'
            ? projectOptions({ projectName: query, saleStatus: '0' })
            : customWorkOptions({ customName: query, sourceType: 'CHARGE', saleStatus: '0' })))
      request.then(r => {
        const rows = r.data || []
        this.itemOptions = rows.map(item => this.form.itemType === 'MEDICINE'
          ? { value: item.medicineId, label: item.medicineName, remainingQuantity: item.remainingQuantity, unitPrice: item.salePrice || item.unitPrice }
          : (this.form.itemType === 'CONSUMABLE'
            ? { value: item.consumableId, label: item.consumableName, remainingQuantity: item.remainingQuantity, unitPrice: item.unitPrice }
            : (this.form.itemType === 'PROJECT'
              ? { value: item.projectId, label: item.projectName, unitPrice: item.unitPrice }
              : { value: item.customId, label: item.customName, unitPrice: item.salePrice })))
        this.itemLoading = false
      })
    },
    handleItemChange(value) {
      const item = this.itemOptions.find(option => option.value === value)
      this.currentAvailable = item ? Number(item.remainingQuantity || 0) : 0
      this.form.unitPrice = item ? Number(item.unitPrice || 0) : 0
      this.form.itemName = item ? item.label : undefined
      this.refreshTotal()
    },
    refreshTotal() { this.form.totalPrice = Number(this.form.unitPrice || 0) * Number(this.form.usedQuantity || 0) },
    calcMedicalTableHeight() {
      this.$nextTick(() => {
        const panel = this.$refs.tablePanel
        this.tableHeight = Math.max(300, panel ? panel.clientHeight : window.innerHeight - 260)
      })
    },
    submitForm() {
      this.refreshTotal()
      if (this.selectManagedItem && !this.form.itemId) { this.$modal.msgError('请选择物品'); return }
      if (this.form.itemType === 'OTHER' && !this.form.itemName) { this.$modal.msgError('请填写名称'); return }
      const req = this.form.usageId ? updateVisitUsage(this.form) : addVisitUsage(this.form)
      req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() })
    },
    handleDelete(row) { this.$modal.confirm('是否确认删除该明细？').then(() => delVisitUsage(row.usageId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) },
    itemTypeName(type) { return { MEDICINE: '药品', CONSUMABLE: '耗材', PROJECT: '项目', CUSTOM: '加工定制', OTHER: '其他' }[type] || type }
  }
}
</script>
<style scoped>
.visit-usage-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 84px);
  overflow: hidden;
  box-sizing: border-box;
}
.usage-toolbar {
  flex: 0 0 auto;
}
.usage-table-panel {
  flex: 1 1 auto;
  min-height: 300px;
  overflow: hidden;
}
.usage-footer {
  flex: 0 0 auto;
}
.usage-total {
  display: flex;
  justify-content: flex-end;
  padding: 12px 4px 0;
  color: #303133;
  font-size: 14px;
}
.usage-total strong {
  margin-left: 8px;
  font-size: 18px;
}
</style>
