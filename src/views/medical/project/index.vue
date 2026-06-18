<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="queryParams.deptId" filterable clearable placeholder="请选择部门">
          <el-option v-for="item in deptOptions" :key="item.deptId" :label="item.deptName" :value="item.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="项目名称" prop="projectName">
        <el-input v-model="queryParams.projectName" clearable placeholder="请输入项目名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="项目类型" prop="projectTypeId">
        <el-select v-model="queryParams.projectTypeId" filterable clearable placeholder="请选择项目类型">
          <el-option v-for="item in typeOptions" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="saleStatus">
        <el-select v-model="queryParams.saleStatus" clearable placeholder="请选择状态">
          <el-option label="上架" value="0" />
          <el-option label="下架" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <el-col :span="1.5"><el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen=true">项目类型</el-button></el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList" :height="tableHeight" border fit>
      <el-table-column label="部门" prop="deptName" min-width="140" show-overflow-tooltip />
      <el-table-column label="项目名称" prop="projectName" min-width="160" show-overflow-tooltip />
      <el-table-column label="项目类型" prop="projectTypeName" min-width="130" show-overflow-tooltip />
      <el-table-column label="单价" prop="unitPrice" width="100" />
      <el-table-column label="单位" prop="unit" width="90" />
      <el-table-column label="状态" prop="saleStatus" width="90"><template slot-scope="scope">{{ scope.row.saleStatus === '1' ? '下架' : '上架' }}</template></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="form.deptId" filterable placeholder="请选择部门" style="width: 100%">
            <el-option v-for="item in deptOptions" :key="item.deptId" :label="item.deptName" :value="item.deptId" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName"><el-input v-model="form.projectName" /></el-form-item>
        <el-form-item label="项目类型" prop="projectTypeText">
          <el-autocomplete v-model="form.projectTypeText" clearable placeholder="请选择或输入项目类型" :fetch-suggestions="queryTypeSuggestions" style="width: 100%" @select="handleTypeSelect" @input="handleTypeInput" />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice"><el-input-number v-model="form.unitPrice" :precision="2" :min="0" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.saleStatus"><el-radio label="0">上架</el-radio><el-radio label="1">下架</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
    <type-manage-dialog v-model="typeOpen" title="项目类型" type-category="PROJECT" @saved="loadTypes" />
  </div>
</template>
<script>
import { listProject, getProject, addProject, updateProject, delProject } from '@/api/medical/project'
import { listHospitalDept } from '@/api/medical/hospitalDept'
import { medicalTypeOptions } from '@/api/medical/type'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'
export default {
  name: 'MedicalProject',
  components: { TypeManageDialog },
  mixins: [medicalTableHeight],
  data() {
    return { loading: true, showSearch: true, total: 0, projectList: [], deptOptions: [], typeOptions: [], open: false, typeOpen: false, title: '', queryParams: { pageNum: 1, pageSize: 10, deptId: undefined, projectName: undefined, projectTypeId: undefined, saleStatus: undefined }, form: {}, rules: { deptId: [{ required: true, message: '部门不能为空', trigger: 'change' }], projectName: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }], unitPrice: [{ required: true, message: '单价不能为空', trigger: 'change' }] } }
  },
  created() { this.getList(); this.loadDepts(); this.loadTypes() },
  methods: {
    getList() { this.loading = true; listProject(this.queryParams).then(r => { this.projectList = r.rows; this.total = r.total; this.loading = false }) },
    loadDepts() { listHospitalDept().then(r => { this.deptOptions = r.data || r.rows || [] }) },
    loadTypes() { medicalTypeOptions({ typeCategory: 'PROJECT' }).then(r => { this.typeOptions = r.data || [] }) },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    reset() { this.form = { saleStatus: '0', unitPrice: 0 } },
    handleAdd() { this.reset(); this.title = '新增项目'; this.open = true },
    handleUpdate(row) { getProject(row.projectId).then(r => { this.form = r.data; this.form.projectTypeText = r.data.projectTypeName; this.title = '修改项目'; this.open = true }) },
    submitForm() { this.$refs.form.validate(valid => { if (!valid) return; const req = this.form.projectId ? updateProject(this.form) : addProject(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList(); this.loadTypes() }) }) },
    handleDelete(row) { this.$modal.confirm('是否确认删除项目"' + row.projectName + '"？').then(() => delProject(row.projectId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) },
    queryTypeSuggestions(queryString, cb) { const keyword = (queryString || '').toLowerCase(); cb(this.typeOptions.filter(item => !keyword || item.typeName.toLowerCase().includes(keyword)).map(item => ({ value: item.typeName, typeId: item.typeId }))) },
    handleTypeSelect(item) { this.form.projectTypeId = item.typeId; this.form.projectTypeText = item.value },
    handleTypeInput() { this.form.projectTypeId = undefined }
  }
}
</script>
