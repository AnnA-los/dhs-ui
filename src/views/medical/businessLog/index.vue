<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="事件类型" prop="businessType">
        <el-select v-model="queryParams.businessType" filterable clearable placeholder="请选择事件类型" style="width: 180px">
          <el-option v-for="item in businessTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务模块" prop="businessModule">
        <el-select v-model="queryParams.businessModule" filterable clearable placeholder="请选择业务模块" style="width: 160px">
          <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    <el-table v-loading="loading" :data="logList" :height="tableHeight" border fit>
      <el-table-column label="操作名称" prop="operationName" min-width="140" />
      <el-table-column label="事件类型" min-width="150">
        <template slot-scope="scope">{{ businessTypeName(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="业务模块" min-width="120">
        <template slot-scope="scope">{{ moduleName(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="操作人" prop="operatorName" min-width="120" show-overflow-tooltip />
      <el-table-column label="结果" prop="resultStatus" width="90">
        <template slot-scope="scope">{{ scope.row.resultStatus === '0' ? '成功' : '失败' }}</template>
      </el-table-column>
      <el-table-column label="操作时间" prop="operationTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.operationTime) }}</template>
      </el-table-column>
      <el-table-column label="操作细节" prop="remark" min-width="260" show-overflow-tooltip />
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
      queryParams: { pageNum: 1, pageSize: 10, businessType: undefined, businessModule: undefined },
      businessTypeOptions: [
        { label: '删除预约', value: 'APPOINTMENT_DELETE' },
        { label: '修改预约', value: 'APPOINTMENT_UPDATE' },
        { label: '删除病历', value: 'VISIT_DELETE' },
        { label: '删除收费明细', value: 'VISIT_USAGE_DELETE' },
        { label: '删除患者档案', value: 'PATIENT_DELETE' },
        { label: '修改患者档案', value: 'PATIENT_UPDATE' },
        { label: '删除收费单', value: 'CHARGE_ORDER_DELETE' },
        { label: '删除药品', value: 'MEDICINE_DELETE' },
        { label: '删除耗材', value: 'CONSUMABLE_DELETE' },
        { label: '删除项目', value: 'PROJECT_DELETE' },
        { label: '删除回访记录', value: 'FOLLOWUP_DELETE' },
        { label: '转让医院超管', value: 'HOSPITAL_OWNER_TRANSFER' }
      ],
      moduleOptions: [
        { label: '预约管理', value: 'appointment' },
        { label: '接诊病历', value: 'visit' },
        { label: '收费明细', value: 'visitUsage' },
        { label: '患者档案', value: 'patient' },
        { label: '收费管理', value: 'charge' },
        { label: '药品管理', value: 'medicine' },
        { label: '耗材管理', value: 'consumable' },
        { label: '项目管理', value: 'project' },
        { label: '回访管理', value: 'followup' },
        { label: '医院管理', value: 'hospital' }
      ]
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
    },
    businessTypeName(row) {
      return row.businessTypeName || this.optionName(this.businessTypeOptions, row.businessType) || row.businessType || '-'
    },
    moduleName(row) {
      return row.businessModuleName || this.optionName(this.moduleOptions, row.businessModule) || row.businessModule || '-'
    },
    optionName(options, value) {
      const item = options.find(option => option.value === value)
      return item ? item.label : ''
    }
  }
}
</script>
