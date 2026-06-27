<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="场景编码" prop="sceneCode">
        <el-select v-model="queryParams.sceneCode" clearable filterable allow-create default-first-option placeholder="请选择场景" style="width: 190px">
          <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="模板名称" prop="templateCode">
        <el-select v-model="queryParams.templateCode" clearable filterable placeholder="请选择模板" style="width: 190px">
          <el-option v-for="item in templateOptions" :key="item.templateCode" :label="item.templateName" :value="item.templateCode" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable placeholder="请选择状态" style="width: 120px">
          <el-option label="启用" value="0" />
          <el-option label="停用" value="1" />
        </el-select>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="relationList" :height="tableHeight" border fit>
      <el-table-column label="场景编码" prop="sceneCode" min-width="150" />
      <el-table-column label="短信模板" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">{{ templateName(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="模板编码" prop="templateCode" min-width="130" />
      <el-table-column label="状态" prop="status" width="90">
        <template slot-scope="scope">{{ statusName(scope.row.status) }}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="场景编码" prop="sceneCode">
          <el-select v-model="form.sceneCode" filterable allow-create default-first-option placeholder="请选择或输入场景编码" style="width: 100%">
            <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="短信模板" prop="templateCode">
          <el-select v-model="form.templateCode" filterable placeholder="请选择短信模板" style="width: 100%">
            <el-option v-for="item in templateOptions" :key="item.templateCode" :label="item.templateName" :value="item.templateCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">启用</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSmsTemplate, listSmsSceneTemplate, getSmsSceneTemplate, addSmsSceneTemplate, updateSmsSceneTemplate, delSmsSceneTemplate } from '@/api/system/sms'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'SmsSceneTemplate',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      relationList: [],
      templateOptions: [],
      open: false,
      title: '',
      sceneOptions: [
        { label: '验证码 YZM', value: 'YZM' },
        { label: '邀请审核通过 INVITE_APPROVED', value: 'INVITE_APPROVED' },
        { label: '邀请审核拒绝 INVITE_REJECTED', value: 'INVITE_REJECTED' }
      ],
      queryParams: { pageNum: 1, pageSize: 10, sceneCode: undefined, templateCode: undefined, status: undefined },
      form: {},
      rules: {
        sceneCode: [{ required: true, message: '场景编码不能为空', trigger: 'change' }],
        templateCode: [{ required: true, message: '短信模板不能为空', trigger: 'change' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadTemplates()
  },
  methods: {
    getList() {
      this.loading = true
      listSmsSceneTemplate(this.queryParams).then(response => {
        this.relationList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      })
    },
    loadTemplates() {
      listSmsTemplate({ pageNum: 1, pageSize: 200, status: '0' }).then(response => {
        this.templateOptions = response.rows || response.data || []
      })
    },
    reset() {
      this.form = { sceneCode: undefined, templateCode: undefined, status: '0', remark: undefined }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleAdd() {
      this.reset()
      this.title = '新增场景关联'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getSmsSceneTemplate(row.relationId).then(response => {
        this.form = response.data || {}
        this.title = '修改场景关联'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const request = this.form.relationId ? updateSmsSceneTemplate(this.form) : addSmsSceneTemplate(this.form)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除场景"' + row.sceneCode + '"的短信模板关联？').then(() => {
        return delSmsSceneTemplate(row.relationId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    },
    templateName(row) {
      if (row.templateName) return row.templateName
      const option = this.templateOptions.find(item => item.templateCode === row.templateCode)
      return option ? option.templateName : row.templateCode || '-'
    },
    statusName(status) {
      return status === '0' ? '启用' : '停用'
    }
  }
}
</script>
