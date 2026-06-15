<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="deptList" :height="tableHeight" border fit row-key="deptId">
      <el-table-column label="部门名称" prop="deptName" min-width="160" />
      <el-table-column label="类型" prop="deptType" width="120" />
      <el-table-column label="排序" prop="orderNum" width="80" />
      <el-table-column label="状态" prop="status" width="90"><template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template></el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级部门"><el-input-number v-model="form.parentId" :min="0" /></el-form-item>
        <el-form-item label="部门名称" prop="deptName"><el-input v-model="form.deptName" /></el-form-item>
        <el-form-item label="部门类型"><el-select v-model="form.deptType"><el-option label="医院主体" value="0" /><el-option label="门店" value="1" /><el-option label="科室" value="2" /><el-option label="职能部门" value="3" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.orderNum" :min="0" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio label="0">正常</el-radio><el-radio label="1">停用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { listHospitalDept, getHospitalDept, addHospitalDept, updateHospitalDept, delHospitalDept } from '@/api/medical/hospitalDept'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
export default { name: 'MedicalHospitalDept', mixins: [medicalTableHeight], data() { return { loading: true, deptList: [], open: false, title: '', form: {}, rules: { deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }] } } }, created() { this.getList() }, methods: { getList() { this.loading = true; listHospitalDept().then(r => { this.deptList = r.data || r.rows || []; this.loading = false }) }, reset() { this.form = { parentId: 0, deptType: '2', orderNum: 0, status: '0' } }, handleAdd() { this.reset(); this.title = '新增医院部门'; this.open = true }, handleUpdate(row) { getHospitalDept(row.deptId).then(r => { this.form = r.data; this.title = '修改医院部门'; this.open = true }) }, submitForm() { this.$refs.form.validate(valid => { if (valid) { const req = this.form.deptId ? updateHospitalDept(this.form) : addHospitalDept(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) } }) }, handleDelete(row) { this.$modal.confirm('是否确认删除部门"' + row.deptName + '"？').then(() => delHospitalDept(row.deptId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) } } }
</script>
