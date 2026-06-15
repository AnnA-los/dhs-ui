<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="业务类型" prop="businessType">
        <el-input v-model="queryParams.businessType" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="业务模块" prop="businessModule">
        <el-input v-model="queryParams.businessModule" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    <el-table v-loading="loading" :data="logList" :height="tableHeight" border fit>
      <el-table-column label="操作名称" prop="operationName" min-width="140" />
      <el-table-column label="业务类型" prop="businessType" min-width="160" />
      <el-table-column label="模块" prop="businessModule" width="120" />
      <el-table-column label="目标类型" prop="targetType" width="120" />
      <el-table-column label="结果" prop="resultStatus" width="90">
        <template slot-scope="scope">{{ scope.row.resultStatus === '0' ? '成功' : '失败' }}</template>
      </el-table-column>
      <el-table-column label="操作时间" prop="operationTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.operationTime) }}</template>
      </el-table-column>
      <el-table-column label="备注" prop="remark" min-width="220" show-overflow-tooltip />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import { listBusinessLog } from '@/api/medical/businessLog'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default { name: 'MedicalBusinessLog', mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      logList: [],
      queryParams: { pageNum: 1, pageSize: 10, businessType: undefined, businessModule: undefined }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listBusinessLog(this.queryParams).then(response => {
        this.logList = response.rows
        this.total = response.total
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
    }
  }
}
</script>
