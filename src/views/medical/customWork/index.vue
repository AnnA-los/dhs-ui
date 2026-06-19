<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="加工名称" prop="customName">
        <el-input v-model="queryParams.customName" clearable placeholder="请输入加工名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="来源" prop="sourceType">
        <el-select v-model="queryParams.sourceType" clearable placeholder="请选择来源">
          <el-option label="单独收费" value="CHARGE" />
          <el-option label="项目内含" value="PROJECT_INCLUDED" />
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customWorkList" :height="tableHeight" border fit>
      <el-table-column label="加工名称" prop="customName" min-width="150" show-overflow-tooltip />
      <el-table-column label="来源" prop="sourceType" width="110"><template slot-scope="scope">{{ sourceTypeName(scope.row.sourceType) }}</template></el-table-column>
      <el-table-column label="关联病历" prop="visitNo" min-width="130" show-overflow-tooltip />
      <el-table-column label="关联项目" prop="projectName" min-width="140" show-overflow-tooltip />
      <el-table-column label="加工厂家" prop="vendorName" min-width="140" show-overflow-tooltip />
      <el-table-column label="加工成本" prop="costAmount" width="110" />
      <el-table-column label="收费单价" prop="salePrice" width="110" />
      <el-table-column label="单位" prop="unit" width="90" />
      <el-table-column label="状态" prop="saleStatus" width="90"><template slot-scope="scope">{{ scope.row.saleStatus === '1' ? '下架' : '上架' }}</template></el-table-column>
      <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="640px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="来源" prop="sourceType">
          <el-radio-group v-model="form.sourceType" @change="handleSourceTypeChange">
            <el-radio label="CHARGE">单独收费</el-radio>
            <el-radio label="PROJECT_INCLUDED">项目内含</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联病历">
          <el-select v-model="form.visitId" filterable remote clearable placeholder="可按病历编号搜索" :remote-method="remoteVisits" :loading="visitLoading" style="width: 100%">
            <el-option v-for="item in visitOptions" :key="item.visitId" :label="item.visitNo" :value="item.visitId" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.sourceType === 'PROJECT_INCLUDED'" label="关联项目" prop="projectId">
          <el-select v-model="form.projectId" filterable remote clearable placeholder="请选择项目" :remote-method="remoteProjects" :loading="projectLoading" style="width: 100%">
            <el-option v-for="item in projectOptions" :key="item.projectId" :label="item.projectName" :value="item.projectId" />
          </el-select>
        </el-form-item>
        <el-form-item label="加工名称" prop="customName"><el-input v-model="form.customName" /></el-form-item>
        <el-form-item label="加工厂家"><el-input v-model="form.vendorName" /></el-form-item>
        <el-form-item label="加工成本" prop="costAmount"><el-input-number v-model="form.costAmount" :precision="2" :min="0" /></el-form-item>
        <el-form-item v-if="form.sourceType === 'CHARGE'" label="收费单价" prop="salePrice"><el-input-number v-model="form.salePrice" :precision="2" :min="0" /></el-form-item>
        <el-form-item label="单位"><el-input v-model="form.unit" /></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.saleStatus"><el-radio label="0">上架</el-radio><el-radio label="1">下架</el-radio></el-radio-group></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import { listCustomWork, getCustomWork, addCustomWork, updateCustomWork, delCustomWork } from '@/api/medical/customWork'
import { visitOptions } from '@/api/medical/visit'
import { projectOptions } from '@/api/medical/project'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalCustomWork',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      visitLoading: false,
      projectLoading: false,
      total: 0,
      customWorkList: [],
      visitOptions: [],
      projectOptions: [],
      open: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, customName: undefined, sourceType: undefined, saleStatus: undefined },
      form: {},
      rules: {
        sourceType: [{ required: true, message: '来源不能为空', trigger: 'change' }],
        customName: [{ required: true, message: '加工名称不能为空', trigger: 'blur' }],
        projectId: [{ required: true, message: '项目内含加工必须选择项目', trigger: 'change' }],
        costAmount: [{ required: true, message: '加工成本不能为空', trigger: 'change' }],
        salePrice: [{ required: true, message: '收费单价不能为空', trigger: 'change' }]
      }
    }
  },
  created() { this.getList(); this.remoteVisits(''); this.remoteProjects('') },
  methods: {
    getList() { this.loading = true; listCustomWork(this.queryParams).then(r => { this.customWorkList = r.rows; this.total = r.total; this.loading = false }) },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.resetForm('queryForm'); this.handleQuery() },
    reset() { this.form = { sourceType: 'CHARGE', costAmount: 0, salePrice: 0, saleStatus: '0' } },
    handleAdd() { this.reset(); this.title = '新增加工'; this.open = true },
    handleUpdate(row) { getCustomWork(row.customId).then(r => { this.form = r.data; this.title = '修改加工'; this.open = true; this.remoteVisits(''); this.remoteProjects('') }) },
    handleSourceTypeChange(value) { if (value === 'CHARGE') this.form.projectId = undefined },
    submitForm() { this.$refs.form.validate(valid => { if (!valid) return; const req = this.form.customId ? updateCustomWork(this.form) : addCustomWork(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) }) },
    handleDelete(row) { this.$modal.confirm('是否确认删除加工项目"' + row.customName + '"？').then(() => delCustomWork(row.customId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) },
    remoteVisits(query) { this.visitLoading = true; visitOptions({ visitNo: query }).then(r => { this.visitOptions = r.data || []; this.visitLoading = false }) },
    remoteProjects(query) { this.projectLoading = true; projectOptions({ projectName: query, saleStatus: '0' }).then(r => { this.projectOptions = r.data || []; this.projectLoading = false }) },
    sourceTypeName(type) { return { CHARGE: '单独收费', PROJECT_INCLUDED: '项目内含' }[type] || type }
  }
}
</script>
