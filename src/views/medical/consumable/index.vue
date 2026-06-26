<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true"><el-form-item label="耗材名称"><el-input v-model="queryParams.consumableName" clearable @keyup.enter.native="handleQuery" /></el-form-item><el-form-item><el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button></el-form-item></el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col><el-col :span="1.5"><el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen=true">耗材类型</el-button></el-col><right-toolbar @queryTable="getList"></right-toolbar></el-row>
    <el-table v-loading="loading" :data="consumableList" :height="tableHeight" border fit>
      <el-table-column label="耗材名称" prop="consumableName" min-width="150" /><el-table-column label="类型" prop="consumableTypeName" min-width="100" /><el-table-column label="采购批次" prop="purchaseBatchNo" min-width="130" /><el-table-column label="采购数量" prop="purchaseQuantity" width="100" /><el-table-column label="剩余数量" prop="remainingQuantity" width="100" /><el-table-column label="单价" prop="unitPrice" width="90" /><el-table-column label="告警阈值" prop="warningThreshold" width="100" /><el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <asset-form :form="form" type-category="CONSUMABLE" name-label="耗材名称" name-prop="consumableName" type-prop="consumableTypeText" primary-key-prop="consumableId" :can-edit-remaining="canEditRemaining" />
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
    <type-manage-dialog v-model="typeOpen" title="耗材类型" type-category="CONSUMABLE" />
  </div>
</template>
<script>
import { listConsumable, getConsumable, addConsumable, updateConsumable, delConsumable } from '@/api/medical/consumable'
import AssetForm from '@/views/medical/medicine/sharedAssetForm.vue'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'
import { checkPermi } from '@/utils/permission'
export default { name: 'MedicalConsumable', components: { AssetForm, TypeManageDialog }, mixins: [medicalTableHeight], data() { return { loading: true, total: 0, consumableList: [], open: false, typeOpen: false, title: '', queryParams: { pageNum: 1, pageSize: 10, consumableName: undefined }, form: {} } }, computed: { canEditRemaining() { return checkPermi(['medical:consumable:stock']) } }, created() { this.getList() }, methods: { getList() { this.loading = true; listConsumable(this.queryParams).then(r => { this.consumableList = r.rows; this.total = r.total; this.loading = false }) }, handleQuery() { this.queryParams.pageNum = 1; this.getList() }, resetQuery() { this.resetForm('queryForm'); this.handleQuery() }, reset() { this.form = { purchaseQuantity: 0, warningThreshold: 0 } }, handleAdd() { this.reset(); this.title = '新增耗材'; this.open = true }, handleUpdate(row) { getConsumable(row.consumableId).then(r => { this.form = r.data; if (!this.canEditRemaining) { delete this.form.remainingQuantity } this.form.consumableTypeText = r.data.consumableTypeName; this.title = '修改耗材'; this.open = true }) }, submitForm() { if (!this.canEditRemaining || !this.form.consumableId) { delete this.form.remainingQuantity } const req = this.form.consumableId ? updateConsumable(this.form) : addConsumable(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) }, handleDelete(row) { this.$modal.confirm('是否确认删除耗材"' + row.consumableName + '"？').then(() => delConsumable(row.consumableId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) } } }
</script>
