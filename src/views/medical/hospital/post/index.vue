<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true">
      <el-form-item label="岗位名称"><el-input v-model="queryParams.postName" clearable @keyup.enter.native="handleQuery" /></el-form-item>
      <el-form-item><el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button><el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button></el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8"><el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col><right-toolbar @queryTable="getList"></right-toolbar></el-row>
    <el-table v-loading="loading" :data="postList" :height="tableHeight" border fit>
      <el-table-column label="岗位名称" prop="postName" min-width="160" />
      <el-table-column label="默认" prop="isDefault" width="90"><template slot-scope="scope">{{ scope.row.isDefault === '1' ? '是' : '否' }}</template></el-table-column>
      <el-table-column label="状态" prop="status" width="90"><template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template></el-table-column>
      <el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="520px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="岗位名称" prop="postName"><el-input v-model="form.postName" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio label="0">正常</el-radio><el-radio label="1">停用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { listHospitalPost, getHospitalPost, addHospitalPost, updateHospitalPost, delHospitalPost } from '@/api/medical/hospitalPost'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
export default { name: 'MedicalHospitalPost', mixins: [medicalTableHeight], data() { return { loading: true, total: 0, postList: [], open: false, title: '', queryParams: { pageNum: 1, pageSize: 10, postName: undefined }, form: {}, rules: { postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }] } } }, created() { this.getList() }, methods: { getList() { this.loading = true; listHospitalPost(this.queryParams).then(r => { this.postList = r.rows; this.total = r.total; this.loading = false }) }, handleQuery() { this.queryParams.pageNum = 1; this.getList() }, resetQuery() { this.resetForm('queryForm'); this.handleQuery() }, reset() { this.form = { status: '0' }; this.resetForm('form') }, handleAdd() { this.reset(); this.title = '新增医院岗位'; this.open = true }, handleUpdate(row) { getHospitalPost(row.postId).then(r => { this.form = r.data; delete this.form.remark; this.title = '修改医院岗位'; this.open = true }) }, submitForm() { this.$refs.form.validate(valid => { if (!valid) return; const data = Object.assign({}, this.form); delete data.remark; const req = data.postId ? updateHospitalPost(data) : addHospitalPost(data); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) }) }, handleDelete(row) { this.$modal.confirm('是否确认删除岗位"' + row.postName + '"？').then(() => delHospitalPost(row.postId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) } } }
</script>
