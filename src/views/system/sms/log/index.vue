<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="手机号" prop="receiverPhone">
        <el-input v-model="queryParams.receiverPhone" clearable placeholder="请输入手机号" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="queryParams.templateName" clearable placeholder="请输入模板名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="场景编码" prop="sceneCode">
        <el-select v-model="queryParams.sceneCode" clearable filterable allow-create default-first-option placeholder="请选择场景" style="width: 190px">
          <el-option v-for="item in sceneOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发送状态" prop="sendStatus">
        <el-select v-model="queryParams.sendStatus" clearable placeholder="请选择状态" style="width: 130px">
          <el-option v-for="item in sendStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="渠道名称" prop="channelName">
        <el-input v-model="queryParams.channelName" clearable placeholder="请输入渠道名称" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>

    <el-table v-loading="loading" :data="logList" :height="tableHeight" border fit>
      <el-table-column label="手机号" min-width="130">
        <template slot-scope="scope">{{ maskPhone(scope.row.receiverPhone) }}</template>
      </el-table-column>
      <el-table-column label="模板名称" prop="templateName" min-width="150" show-overflow-tooltip />
      <el-table-column label="模板编码" prop="templateCode" min-width="130" show-overflow-tooltip />
      <el-table-column label="场景编码" prop="sceneCode" min-width="150" />
      <el-table-column label="渠道名称" prop="channelName" min-width="140" show-overflow-tooltip />
      <el-table-column label="发送状态" prop="sendStatus" width="100">
        <template slot-scope="scope">{{ sendStatusName(scope.row.sendStatus) }}</template>
      </el-table-column>
      <el-table-column label="错误详情" min-width="220" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-button v-if="scope.row.failReason" type="text" size="mini" @click="showFailReason(scope.row)">查看</el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="来源 IP" prop="sourceIp" min-width="130" />
      <el-table-column label="创建时间" prop="createTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="错误详情" :visible.sync="failReasonOpen" width="560px" append-to-body>
      <div class="fail-reason">{{ currentFailReason }}</div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="failReasonOpen = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSmsSendLog } from '@/api/system/sms'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'SmsSendLog',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      logList: [],
      failReasonOpen: false,
      currentFailReason: '',
      sceneOptions: [
        { label: '验证码 YZM', value: 'YZM' },
        { label: '邀请审核通过 INVITE_APPROVED', value: 'INVITE_APPROVED' },
        { label: '邀请审核拒绝 INVITE_REJECTED', value: 'INVITE_REJECTED' }
      ],
      sendStatusOptions: [
        { label: '成功', value: 'SUCCESS' },
        { label: '失败', value: 'FAILED' },
        { label: '跳过', value: 'SKIPPED' }
      ],
      queryParams: { pageNum: 1, pageSize: 10, receiverPhone: undefined, templateName: undefined, sceneCode: undefined, sendStatus: undefined, channelName: undefined }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listSmsSendLog(this.queryParams).then(response => {
        this.logList = response.rows || []
        this.total = response.total || 0
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
    showFailReason(row) {
      this.currentFailReason = this.maskFailReason(row.failReason)
      this.failReasonOpen = true
    },
    maskPhone(phone) {
      const value = String(phone || '')
      if (value.length < 7) return value || '-'
      return value.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
    },
    maskFailReason(reason) {
      return String(reason || '-')
        .replace(/1[3-9]\d{9}/g, value => this.maskPhone(value))
        .replace(/(验证码|code|Code|CODE)([:：= ]*)([A-Za-z0-9]{4,8})/g, '$1$2****')
        .replace(/(secret|Secret|SECRET|key|Key|KEY|token|Token|TOKEN)([:：= ]*)([^,，;\s]+)/g, '$1$2****')
    },
    sendStatusName(status) {
      const item = this.sendStatusOptions.find(option => option.value === status)
      return item ? item.label : status || '-'
    }
  }
}
</script>

<style scoped>
.fail-reason {
  min-height: 96px;
  padding: 10px 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  background: #f8fafc;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
</style>
