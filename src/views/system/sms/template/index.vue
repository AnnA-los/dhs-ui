<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="模板编码" prop="templateCode">
        <el-input v-model="queryParams.templateCode" clearable placeholder="请输入模板编码" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" clearable placeholder="请输入模板名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="场景编码" prop="sceneCode">
        <el-select v-model="queryParams.sceneCode" clearable filterable allow-create default-first-option placeholder="请选择场景" style="width: 170px">
          <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="渠道名称" prop="channelCode">
        <el-select v-model="queryParams.channelCode" clearable filterable placeholder="请选择渠道" style="width: 180px">
          <el-option v-for="item in channelOptions" :key="item.channelCode" :label="item.channelName" :value="item.channelCode" />
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

    <el-table v-loading="loading" :data="templateList" :height="tableHeight" border fit>
      <el-table-column label="模板编码" prop="templateCode" min-width="130" show-overflow-tooltip />
      <el-table-column label="模板名称" prop="templateName" min-width="150" show-overflow-tooltip />
      <el-table-column label="场景编码" prop="sceneCode" min-width="140" />
      <el-table-column label="渠道名称" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ channelName(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="签名" prop="signName" min-width="120" show-overflow-tooltip />
      <el-table-column label="优先级" prop="priority" width="90" />
      <el-table-column label="状态" prop="status" width="90">
        <template slot-scope="scope">{{ statusName(scope.row.status) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="模板编码" prop="templateCode">
              <el-input v-model="form.templateCode" :disabled="isEdit" placeholder="DMT开头共8位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" :disabled="isEdit" placeholder="请输入模板名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="场景编码" prop="sceneCode">
              <el-select v-model="form.sceneCode" filterable allow-create default-first-option placeholder="请选择或输入场景编码" style="width: 100%">
                <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="短信渠道" prop="channelCode">
              <el-select v-model="form.channelCode" filterable placeholder="请选择短信渠道" style="width: 100%">
                <el-option v-for="item in channelOptions" :key="item.channelCode" :label="item.channelName" :value="item.channelCode" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="渠道模板编码" prop="providerTemplateCode">
              <el-input v-model="form.providerTemplateCode" placeholder="请输入渠道侧模板编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="短信签名" prop="signName">
              <el-input v-model="form.signName" placeholder="请输入短信签名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="form.priority" :min="1" :max="9999" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="0">启用</el-radio>
                <el-radio label="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容模板" prop="contentTemplate">
              <el-input v-model="form.contentTemplate" type="textarea" :rows="4" placeholder="请输入内容模板，变量使用后端约定占位符" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSmsChannel, listSmsTemplate, getSmsTemplate, addSmsTemplate, updateSmsTemplate, delSmsTemplate } from '@/api/system/sms'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'SmsTemplate',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      templateList: [],
      channelOptions: [],
      open: false,
      title: '',
      sceneOptions: [
        { label: '验证码 YZM', value: 'YZM' },
        { label: '邀请审核通过 INVITE_APPROVED', value: 'INVITE_APPROVED' },
        { label: '邀请审核拒绝 INVITE_REJECTED', value: 'INVITE_REJECTED' }
      ],
      queryParams: { pageNum: 1, pageSize: 10, templateCode: undefined, templateName: undefined, sceneCode: undefined, channelCode: undefined, status: undefined },
      form: {},
      rules: {
        templateCode: [{ required: true, message: '模板编码不能为空', trigger: 'blur' }],
        templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
        sceneCode: [{ required: true, message: '场景编码不能为空', trigger: 'change' }],
        channelCode: [{ required: true, message: '短信渠道不能为空', trigger: 'change' }],
        contentTemplate: [{ required: true, message: '内容模板不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.form.templateId
    }
  },
  created() {
    this.getList()
    this.loadChannels()
  },
  methods: {
    getList() {
      this.loading = true
      listSmsTemplate(this.queryParams).then(response => {
        this.templateList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      })
    },
    loadChannels() {
      listSmsChannel({ pageNum: 1, pageSize: 200, status: '0' }).then(response => {
        this.channelOptions = response.rows || response.data || []
      })
    },
    reset() {
      this.form = { templateCode: undefined, templateName: undefined, sceneCode: undefined, channelCode: undefined, providerTemplateCode: undefined, signName: undefined, contentTemplate: undefined, priority: 100, status: '0', remark: undefined }
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
      this.title = '新增短信模板'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getSmsTemplate(row.templateId).then(response => {
        this.form = Object.assign({ priority: 100, status: '0' }, response.data || {})
        this.title = '修改短信模板'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const request = this.form.templateId ? updateSmsTemplate(this.form) : addSmsTemplate(this.form)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除短信模板"' + row.templateName + '"？').then(() => {
        return delSmsTemplate(row.templateId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    },
    channelName(row) {
      if (row.channelName) return row.channelName
      const option = this.channelOptions.find(item => item.channelCode === row.channelCode)
      return option ? option.channelName : row.channelCode || '-'
    },
    statusName(status) {
      return status === '0' ? '启用' : '停用'
    }
  }
}
</script>
