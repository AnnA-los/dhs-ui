<template>
  <div class="app-container">
    <el-form ref="queryForm" :model="queryParams" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="渠道编码" prop="channelCode">
        <el-input v-model="queryParams.channelCode" clearable placeholder="请输入渠道编码" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="渠道名称" prop="channelName">
        <el-input v-model="queryParams.channelName" clearable placeholder="请输入渠道名称" @keyup.enter.native="handleQuery" />
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

    <el-table v-loading="loading" :data="channelList" :height="tableHeight" border fit>
      <el-table-column label="渠道编码" prop="channelCode" min-width="130" show-overflow-tooltip />
      <el-table-column label="渠道名称" prop="channelName" min-width="150" show-overflow-tooltip />
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

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="渠道编码" prop="channelCode">
          <el-input v-model="form.channelCode" :disabled="isEdit" placeholder="请输入渠道编码" />
        </el-form-item>
        <el-form-item label="渠道名称" prop="channelName">
          <el-input v-model="form.channelName" :disabled="isEdit" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="渠道参数" prop="channelParams">
          <el-input v-model="form.channelParams" type="textarea" :rows="4" placeholder="请输入渠道参数占位或加密后的配置" />
        </el-form-item>
        <el-form-item label="出参结构" prop="channelResultSchema">
          <el-input v-model="form.channelResultSchema" type="textarea" :rows="3" placeholder="请输入渠道出参结构说明" />
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
import { listSmsChannel, getSmsChannel, addSmsChannel, updateSmsChannel, delSmsChannel } from '@/api/system/sms'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'SmsChannel',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      channelList: [],
      open: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, channelCode: undefined, channelName: undefined, status: undefined },
      form: {},
      rules: {
        channelCode: [{ required: true, message: '渠道编码不能为空', trigger: 'blur' }],
        channelName: [{ required: true, message: '渠道名称不能为空', trigger: 'blur' }],
        status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
      }
    }
  },
  computed: {
    isEdit() {
      return !!this.form.channelId
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listSmsChannel(this.queryParams).then(response => {
        this.channelList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      })
    },
    reset() {
      this.form = { channelCode: undefined, channelName: undefined, channelParams: undefined, channelResultSchema: undefined, status: '0', remark: undefined }
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
      this.title = '新增短信渠道'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getSmsChannel(row.channelId).then(response => {
        this.form = response.data || {}
        this.title = '修改短信渠道'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const request = this.form.channelId ? updateSmsChannel(this.form) : addSmsChannel(this.form)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除短信渠道"' + row.channelName + '"？').then(() => {
        return delSmsChannel(row.channelId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    cancel() {
      this.open = false
      this.reset()
    },
    statusName(status) {
      return status === '0' ? '启用' : '停用'
    }
  }
}
</script>
