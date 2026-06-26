<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="患者" prop="patientId">
        <el-select v-model="queryParams.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading">
          <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="负责人" prop="ownerUserId">
        <el-select v-model="queryParams.ownerUserId" filterable remote clearable placeholder="请选择负责人" :remote-method="remoteUsers" :loading="userLoading">
          <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="回访时间">
        <el-date-picker v-model="followupTimeRange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" @change="handleFollowupTimeRangeChange" />
      </el-form-item>
      <el-form-item label="回访状态" prop="followupStatus">
        <el-select v-model="queryParams.followupStatus" filterable clearable placeholder="请选择回访状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="回访类型" prop="followupType">
        <el-select v-model="queryParams.followupType" filterable clearable placeholder="请选择回访类型">
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
    <el-table v-loading="loading" :data="followupList" :height="tableHeight" border fit>
      <el-table-column label="患者" prop="patientName" min-width="150" show-overflow-tooltip />
      <el-table-column label="病历编号" prop="visitNo" min-width="150" show-overflow-tooltip />
      <el-table-column label="负责人" prop="ownerUserName" min-width="120" show-overflow-tooltip />
      <el-table-column label="回访时间" prop="followupTime" min-width="170"><template slot-scope="scope">{{ parseTime(scope.row.followupTime) }}</template></el-table-column>
      <el-table-column label="回访类型" prop="followupType" min-width="90"><template slot-scope="scope">{{ typeName(scope.row.followupType) }}</template></el-table-column>
      <el-table-column label="回访状态" prop="followupStatus" min-width="90"><template slot-scope="scope">{{ statusName(scope.row.followupStatus) }}</template></el-table-column>
      <el-table-column label="结果" prop="followupResult" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="150"><template slot-scope="scope"><el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button><el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button></template></el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="患者" prop="patientId">
          <el-select v-model="form.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading" :disabled="!!form.followupId" style="width: 100%" @change="handlePatientChange">
            <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
          </el-select>
        </el-form-item>
        <el-form-item label="病历编号" prop="visitId">
          <el-select v-model="form.visitId" filterable remote clearable placeholder="请先选择患者" :remote-method="remoteVisits" :loading="visitLoading" :disabled="!form.patientId" style="width: 100%">
            <el-option v-for="item in visitOptions" :key="item.visitId" :label="item.visitNo" :value="item.visitId" />
          </el-select>
        </el-form-item>
        <el-form-item label="负责人" prop="ownerUserId">
          <el-select v-model="form.ownerUserId" filterable remote clearable placeholder="请选择负责人" :remote-method="remoteUsers" :loading="userLoading" style="width: 100%">
            <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
          </el-select>
        </el-form-item>
        <el-form-item label="回访时间"><el-date-picker v-model="form.followupTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" /></el-form-item>
        <el-form-item label="回访类型"><el-select v-model="form.followupType"><el-option label="复诊" value="0" /><el-option label="术后" value="1" /><el-option label="欠费" value="2" /><el-option label="其他" value="3" /></el-select></el-form-item>
        <el-form-item label="回访状态"><el-select v-model="form.followupStatus"><el-option label="待回访" value="0" /><el-option label="已完成" value="1" /><el-option label="已取消" value="2" /></el-select></el-form-item>
        <el-form-item label="结果"><el-input v-model="form.followupResult" type="textarea" /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer"><el-button type="primary" @click="submitForm">确 定</el-button><el-button @click="open=false">取 消</el-button></div>
    </el-dialog>
  </div>
</template>
<script>
import { listFollowup, getFollowup, addFollowup, updateFollowup, delFollowup } from '@/api/medical/followup'
import { patientOptions as queryPatients } from '@/api/medical/patient'
import { visitOptions as queryVisits } from '@/api/medical/visit'
import { hospitalUserOptions } from '@/api/medical/hospitalUser'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
export default {
  name: 'MedicalFollowup',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      patientLoading: false,
      visitLoading: false,
      userLoading: false,
      total: 0,
      followupList: [],
      patientOptions: [],
      visitOptions: [],
      userOptions: [],
      followupTimeRange: this.getCurrentMonthTimeRange(),
      open: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, patientId: undefined, ownerUserId: undefined, followupStatus: undefined, followupType: undefined, params: {} },
      form: {},
      rules: {
        patientId: [{ required: true, message: '患者不能为空', trigger: 'change' }]
      },
      typeOptions: [{ label: '复诊', value: '0' }, { label: '术后', value: '1' }, { label: '欠费', value: '2' }, { label: '其他', value: '3' }],
      statusOptions: [{ label: '待回访', value: '0' }, { label: '已完成', value: '1' }, { label: '已取消', value: '2' }]
    }
  },
  created() {
    this.getList()
    this.remotePatients('')
    this.remoteUsers('')
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.params = {
        beginTime: this.followupTimeRange && this.followupTimeRange.length ? this.followupTimeRange[0] : undefined,
        endTime: this.followupTimeRange && this.followupTimeRange.length ? this.followupTimeRange[1] : undefined
      }
      listFollowup(this.queryParams).then(r => { this.followupList = r.rows; this.total = r.total; this.loading = false })
    },
    remotePatients(query) { this.patientLoading = true; queryPatients({ patientName: query }).then(r => { this.patientOptions = r.data || []; this.patientLoading = false }) },
    remoteVisits(query) {
      if (!this.form.patientId) {
        this.visitOptions = []
        return
      }
      this.visitLoading = true
      queryVisits({ patientId: this.form.patientId, visitNo: query, optionOrder: 'createTime' }).then(r => { this.visitOptions = r.data || []; this.visitLoading = false })
    },
    remoteUsers(query) { this.userLoading = true; hospitalUserOptions({ nickName: query }).then(r => { this.userOptions = r.data || []; this.userLoading = false }) },
    handlePatientChange() {
      this.form.visitId = undefined
      this.remoteVisits('')
    },
    reset() { this.form = { followupType: '0', followupStatus: '0' }; this.visitOptions = []; this.resetForm('form') },
    handleQuery() { this.queryParams.pageNum = 1; this.getList() },
    resetQuery() { this.followupTimeRange = this.getCurrentMonthTimeRange(); this.resetForm('queryForm'); this.handleQuery() },
    handleFollowupTimeRangeChange(value) { this.followupTimeRange = this.restoreCurrentMonthRange(value, true); this.handleQuery() },
    handleAdd() { this.reset(); this.title = '新增回访'; this.open = true },
    handleUpdate(row) { getFollowup(row.followupId).then(r => { this.form = r.data; this.remoteVisits(''); this.title = '修改回访'; this.open = true }) },
    submitForm() { this.$refs.form.validate(valid => { if (!valid) return; const req = this.form.followupId ? updateFollowup(this.form) : addFollowup(this.form); req.then(() => { this.$modal.msgSuccess('保存成功'); this.open = false; this.getList() }) }) },
    handleDelete(row) { this.$modal.confirm('是否确认删除回访记录？').then(() => delFollowup(row.followupId)).then(() => { this.getList(); this.$modal.msgSuccess('删除成功') }).catch(() => {}) },
    typeName(type) { return { '0': '复诊', '1': '术后', '2': '欠费', '3': '其他' }[type] || type },
    statusName(status) { return { '0': '待回访', '1': '已完成', '2': '已取消' }[status] || status }
  }
}
</script>
