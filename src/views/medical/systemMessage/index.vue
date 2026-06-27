<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="标题" prop="messageTitle">
        <el-input v-model="queryParams.messageTitle" placeholder="请输入消息标题" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="目标类型" prop="targetType">
        <el-select v-model="queryParams.targetType" placeholder="请选择目标类型" clearable style="width: 150px">
          <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发送状态" prop="sendStatus">
        <el-select v-model="queryParams.sendStatus" placeholder="请选择发送状态" clearable style="width: 140px">
          <el-option v-for="item in sendStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['medical:system:message:send']">新增消息</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="messageList" :height="tableHeight" border fit>
      <el-table-column label="标题" prop="messageTitle" min-width="180" show-overflow-tooltip />
      <el-table-column label="目标类型" prop="targetType" width="120">
        <template slot-scope="scope">{{ optionName(targetTypeOptions, scope.row.targetType) || scope.row.targetType || '-' }}</template>
      </el-table-column>
      <el-table-column label="目标值" prop="targetValue" min-width="180" show-overflow-tooltip />
      <el-table-column label="发送数量" prop="sentCount" width="100">
        <template slot-scope="scope">{{ scope.row.sentCount || 0 }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="sendStatus" width="100">
        <template slot-scope="scope">
          <el-tag :type="sendStatusTag(scope.row.sendStatus)" size="mini">{{ optionName(sendStatusOptions, scope.row.sendStatus) || scope.row.sendStatus || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="失败原因" prop="failReason" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.failReason || '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-view" @click="handleDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="消息标题" prop="messageTitle">
          <el-input v-model="form.messageTitle" :disabled="detailMode" placeholder="请输入消息标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="消息内容" prop="messageContent">
          <el-input v-model="form.messageContent" :disabled="detailMode" type="textarea" :rows="6" placeholder="请输入消息内容" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="目标类型" prop="targetType">
          <el-select v-model="form.targetType" :disabled="detailMode" placeholder="请选择目标类型" style="width: 100%">
            <el-option v-for="item in targetTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标值" prop="targetValue">
          <el-input v-model="form.targetValue" :disabled="detailMode" type="textarea" :rows="3" placeholder="多个目标用英文逗号分隔" />
        </el-form-item>
        <el-form-item v-if="detailMode" label="发送状态">
          <el-tag :type="sendStatusTag(form.sendStatus)" size="mini">{{ optionName(sendStatusOptions, form.sendStatus) || form.sendStatus || '-' }}</el-tag>
        </el-form-item>
        <el-form-item v-if="detailMode" label="失败原因">
          <span>{{ form.failReason || '-' }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <template v-if="!detailMode">
          <el-button type="primary" :loading="submitLoading" @click="submitSend">发送</el-button>
        </template>
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSystemMessage, dispatchSystemMessage } from '@/api/medical/systemMessage'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalSystemMessage',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      submitLoading: false,
      showSearch: true,
      total: 0,
      messageList: [],
      open: false,
      detailMode: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, messageTitle: undefined, targetType: undefined, sendStatus: undefined },
      form: {},
      targetTypeOptions: [
        { label: '手机号', value: 'PHONE' },
        { label: '医院ID', value: 'HOSPITAL' },
        { label: '全局用户ID', value: 'UID' },
        { label: '医院用户ID', value: 'HOSPITAL_USER' }
      ],
      sendStatusOptions: [
        { label: '草稿', value: 'DRAFT' },
        { label: '已发送', value: 'SENT' },
        { label: '发送失败', value: 'FAILED' }
      ],
      rules: {
        messageTitle: [{ required: true, message: '消息标题不能为空', trigger: 'blur' }],
        messageContent: [{ required: true, message: '消息内容不能为空', trigger: 'blur' }],
        targetType: [{ required: true, message: '目标类型不能为空', trigger: 'change' }],
        targetValue: [{ required: true, message: '目标值不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listSystemMessage(this.queryParams).then(response => {
        this.messageList = response.rows || response.data || []
        this.total = response.total || this.messageList.length
        this.loading = false
      }).catch(() => {
        this.messageList = []
        this.total = 0
        this.loading = false
      })
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    reset() {
      this.form = { messageTitle: undefined, messageContent: undefined, targetType: undefined, targetValue: undefined }
      this.resetForm('form')
    },
    handleAdd() {
      this.reset()
      this.detailMode = false
      this.title = '新增系统消息'
      this.open = true
    },
    handleDetail(row) {
      this.form = row
      this.detailMode = true
      this.title = '系统消息详情'
      this.open = true
    },
    submitSend() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        if (!this.hasTargets()) {
          this.$modal.msgError('目标解析为空，不能发送')
          return
        }
        this.submitLoading = true
        dispatchSystemMessage(this.form).then(() => {
          this.$modal.msgSuccess('发送成功')
          this.open = false
          this.getList()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    sendStatusTag(status) {
      const map = { DRAFT: 'info', SENT: 'success', FAILED: 'danger' }
      return map[status] || 'info'
    },
    optionName(options, value) {
      const item = options.find(option => option.value === value)
      return item ? item.label : ''
    },
    hasTargets() {
      return String(this.form.targetValue || '').split(',').some(item => item.trim())
    }
  }
}
</script>
