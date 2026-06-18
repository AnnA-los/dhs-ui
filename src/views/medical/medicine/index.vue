<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true"><el-form-item label="药品名称"><el-input v-model="queryParams.medicineName" clearable @keyup.enter.native="handleQuery" /></el-form-item><el-form-item><el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button></el-form-item></el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col><el-col :span="1.5"><el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen=true">药品类型</el-button></el-col><right-toolbar @queryTable="getList"></right-toolbar></el-row>
    <el-table v-loading="loading" :data="medicineList" :height="tableHeight" border fit>
      <el-table-column label="药品名称" prop="medicineName" min-width="150" /><el-table-column label="类型" prop="medicineTypeName" min-width="100" /><el-table-column label="过期时间" prop="expireTime" width="120" /><el-table-column label="采购批次" prop="purchaseBatchNo" min-width="130" /><el-table-column label="采购数量" prop="purchaseQuantity" width="100" /><el-table-column label="剩余数量" prop="remainingQuantity" width="100" /><el-table-column label="单价" prop="unitPrice" width="90" /><el-table-column label="售价" prop="salePrice" width="90" /><el-table-column label="告警阈值" prop="warningThreshold" width="100" /><el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <asset-form ref="assetForm" :form="form" type-category="MEDICINE" name-label="药品名称" name-prop="medicineName" type-prop="medicineTypeText" primary-key-prop="medicineId" :can-edit-remaining="canEditRemaining" />
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
    <type-manage-dialog v-model="typeOpen" title="药品类型" type-category="MEDICINE" />
  </div>
</template>
<script>
import { listMedicine, getMedicine, addMedicine, updateMedicine, delMedicine } from '@/api/medical/medicine'
import AssetForm from './sharedAssetForm.vue'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'
import { checkPermi } from '@/utils/permission'
export default { name: 'MedicalMedicine', components: { AssetForm, TypeManageDialog }, mixins: [medicalTableHeight], data() { return { loading: true, total: 0, medicineList: [], open: false, typeOpen: false, title: '', queryParams: { pageNum: 1, pageSize: 10, medicineName: undefined }, form: {} } }, computed: { canEditRemaining() { return checkPermi(['medical:medicine:stock']) } }, created() { this.getList() }, methods: { getList() { this.loading = true; listMedicine(this.queryParams).then(r => { this.medicineList = r.rows; this.total = r.total; this.loading = false }) }, handleQuery() { this.queryParams.pageNum = 1; this.getList() }, resetQuery() { this.resetForm('queryForm'); this.handleQuery() }, reset() { this.form = { purchaseQuantity: 0, warningThreshold: 0 } }, handleAdd() { this.reset(); this.title = '新增药品'; this.open = true }, handleUpdate(row) { getMedicine(row.medicineId).then(r => { this.form = r.data; if (!this.canEditRemaining) { delete this.form.remainingQuantity } this.form.medicineTypeText = r.data.medicineTypeName; this.title = '修改药品'; this.open = true }) }, submitForm() { if (!this.canEditRemaining || !this.form.medicineId) { delete this.form.remainingQuantity } const req = this.form.medicineId ? updateMedicine(this.form) : addMedicine(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) }, handleDelete(row) { this.$modal.confirm('是否确认删除药品"' + row.medicineName + '"？').then(() => delMedicine(row.medicineId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) } } }
</script>
