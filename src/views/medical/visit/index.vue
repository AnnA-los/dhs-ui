<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col><right-toolbar @queryTable="getList"></right-toolbar></el-row>
    <el-table v-loading="loading" :data="visitList" :height="tableHeight" border fit>
      <el-table-column label="患者" prop="patientName" min-width="150" show-overflow-tooltip><template slot-scope="scope">{{ scope.row.patientName || '-' }}</template></el-table-column>
      <el-table-column label="医生" prop="doctorName" min-width="150" show-overflow-tooltip><template slot-scope="scope">{{ scope.row.doctorName || '-' }}</template></el-table-column>
      <el-table-column label="接诊时间" prop="visitTime" width="170"><template slot-scope="scope">{{ parseTime(scope.row.visitTime) }}</template></el-table-column>
      <el-table-column label="主诉" prop="chiefComplaint" min-width="180" show-overflow-tooltip />
      <el-table-column label="诊断" prop="diagnosis" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" prop="recordStatus" width="90" />
      <el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="720px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row><el-col :span="12"><el-form-item label="患者" prop="patientId"><el-input-number v-model="form.patientId" :min="1" /></el-form-item></el-col><el-col :span="12"><el-form-item label="医生" prop="doctorUserId"><el-input-number v-model="form.doctorUserId" :min="1" /></el-form-item></el-col></el-row>
        <el-form-item label="接诊时间"><el-date-picker v-model="form.visitTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item>
        <el-form-item label="主诉"><el-input v-model="form.chiefComplaint" type="textarea" /></el-form-item>
        <el-form-item label="诊断"><el-input v-model="form.diagnosis" type="textarea" /></el-form-item>
        <el-form-item label="治疗计划"><el-input v-model="form.treatmentPlan" type="textarea" /></el-form-item>
        <el-form-item label="病历状态"><el-select v-model="form.recordStatus"><el-option label="草稿" value="0" /><el-option label="已提交" value="1" /><el-option label="已归档" value="2" /></el-select></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { listVisit, getVisit, addVisit, updateVisit, delVisit } from '@/api/medical/visit'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
export default { name: 'MedicalVisit', mixins: [medicalTableHeight], data() { return { loading: true, total: 0, visitList: [], open: false, title: '', queryParams: { pageNum: 1, pageSize: 10 }, form: {}, rules: { patientId: [{ required: true, message: '患者不能为空', trigger: 'blur' }], doctorUserId: [{ required: true, message: '医生不能为空', trigger: 'blur' }] } } }, created() { this.getList() }, methods: { getList() { this.loading = true; listVisit(this.queryParams).then(r => { this.visitList = r.rows; this.total = r.total; this.loading = false }) }, reset() { this.form = { recordStatus: '0' } }, handleAdd() { this.reset(); this.title = '新增接诊病历'; this.open = true }, handleUpdate(row) { getVisit(row.visitId).then(r => { this.form = r.data; this.title = '修改接诊病历'; this.open = true }) }, submitForm() { this.$refs.form.validate(valid => { if (valid) { const req = this.form.visitId ? updateVisit(this.form) : addVisit(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) } }) }, handleDelete(row) { this.$modal.confirm('是否确认删除接诊记录？').then(() => delVisit(row.visitId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) } } }
</script>
