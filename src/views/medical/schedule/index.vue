<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="员工" prop="hospitalUserId">
        <el-select v-model="queryParams.hospitalUserId" filterable remote clearable placeholder="请选择员工" :remote-method="remoteUsers" :loading="userLoading">
          <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="排班类型" prop="workType">
        <el-select v-model="queryParams.workType" clearable placeholder="请选择排班类型">
          <el-option v-for="item in workTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="排班日期">
        <el-date-picker v-model="dateRange" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="handleDateRangeChange" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button v-hasPermi="['medical:schedule:add']" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="scheduleList" :height="tableHeight" border fit>
      <el-table-column label="员工" prop="hospitalUserName" min-width="120" show-overflow-tooltip />
      <el-table-column label="部门" prop="deptName" min-width="120" show-overflow-tooltip />
      <el-table-column label="岗位" prop="postName" min-width="110" show-overflow-tooltip />
      <el-table-column label="排班日期" prop="scheduleDate" min-width="120">
        <template slot-scope="scope">{{ parseTime(scope.row.scheduleDate, '{y}-{m}-{d}') }}</template>
      </el-table-column>
      <el-table-column label="排班类型" prop="workType" min-width="100">
        <template slot-scope="scope"><el-tag :type="workTypeTag(scope.row.workType)">{{ workTypeName(scope.row.workType) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="开始时间" prop="startTime" min-width="100" />
      <el-table-column label="结束时间" prop="endTime" min-width="100" />
      <el-table-column label="预约粒度" prop="appointmentInterval" min-width="100">
        <template slot-scope="scope">{{ scope.row.appointmentInterval ? scope.row.appointmentInterval + '分钟' : '-' }}</template>
      </el-table-column>
      <el-table-column label="最大预约数" prop="maxAppointments" min-width="100" />
      <el-table-column label="提醒" prop="remindStatus" min-width="80">
        <template slot-scope="scope">{{ scope.row.workType === 'SHIFT' ? (scope.row.remindStatus === '1' ? '已提醒' : '未提醒') : '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="150">
        <template slot-scope="scope">
          <el-button v-hasPermi="['medical:schedule:edit']" type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button v-hasPermi="['medical:schedule:remove']" type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="员工" prop="hospitalUserId">
          <el-select v-model="form.hospitalUserId" filterable remote clearable placeholder="请选择医生或护士" :remote-method="remoteUsers" :loading="userLoading" style="width: 100%">
            <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="userLabel(item)" :value="item.hospitalUserId" />
          </el-select>
        </el-form-item>
        <el-form-item label="排班日期" prop="scheduleDate">
          <el-date-picker v-model="form.scheduleDate" type="date" value-format="yyyy-MM-dd" placeholder="请选择排班日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排班类型" prop="workType">
          <el-radio-group v-model="form.workType" @change="handleWorkTypeChange">
            <el-radio-button label="SHIFT">有排班</el-radio-button>
            <el-radio-button label="REST">休息</el-radio-button>
            <el-radio-button label="ALL_DAY">全天在岗</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-row v-if="form.workType === 'SHIFT'" :gutter="12">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-picker v-model="form.startTime" value-format="HH:mm" format="HH:mm" placeholder="开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-picker v-model="form.endTime" value-format="HH:mm" format="HH:mm" placeholder="结束时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="form.workType === 'SHIFT'" :gutter="12">
          <el-col :span="12">
            <el-form-item label="预约粒度" prop="appointmentInterval">
              <el-select v-model="form.appointmentInterval" style="width: 100%">
                <el-option v-for="item in intervalOptions" :key="item" :label="item + '分钟'" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最大预约数" prop="maxAppointments">
              <el-input-number v-model="form.maxAppointments" :min="1" :max="20" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSchedule, getSchedule, addSchedule, updateSchedule, delSchedule } from '@/api/medical/schedule'
import { hospitalUserOptions } from '@/api/medical/hospitalUser'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalSchedule',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      open: false,
      title: '',
      total: 0,
      userLoading: false,
      scheduleList: [],
      userOptions: [],
      dateRange: this.getCurrentMonthRange(),
      queryParams: { pageNum: 1, pageSize: 10, hospitalUserId: undefined, workType: undefined, params: {} },
      form: {},
      intervalOptions: [10, 15, 20, 30, 60],
      workTypeOptions: [
        { label: '有排班', value: 'SHIFT' },
        { label: '休息', value: 'REST' },
        { label: '全天在岗', value: 'ALL_DAY' }
      ],
      rules: {
        hospitalUserId: [{ required: true, message: '员工不能为空', trigger: 'change' }],
        scheduleDate: [{ required: true, message: '排班日期不能为空', trigger: 'change' }],
        workType: [{ required: true, message: '排班类型不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.remoteUsers('')
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.params = {
        beginTime: this.dateRange && this.dateRange.length ? this.dateRange[0] : undefined,
        endTime: this.dateRange && this.dateRange.length ? this.dateRange[1] : undefined
      }
      listSchedule(this.queryParams).then(response => {
        this.scheduleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    remoteUsers(query) {
      this.userLoading = true
      hospitalUserOptions({ nickName: query }).then(response => {
        this.userOptions = response.data || []
        this.userLoading = false
      })
    },
    reset() {
      this.form = { workType: 'SHIFT', appointmentInterval: 30, maxAppointments: 1 }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = this.getCurrentMonthRange()
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDateRangeChange(value) {
      this.dateRange = this.restoreCurrentMonthRange(value, false)
      this.handleQuery()
    },
    handleAdd() {
      this.reset()
      this.title = '新增排班'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getSchedule(row.scheduleId).then(response => {
        this.form = response.data
        this.title = '修改排班'
        this.open = true
      })
    },
    handleWorkTypeChange(value) {
      if (value !== 'SHIFT') {
        this.form.startTime = undefined
        this.form.endTime = undefined
        this.form.appointmentInterval = undefined
        this.form.maxAppointments = undefined
      } else {
        this.form.appointmentInterval = this.form.appointmentInterval || 30
        this.form.maxAppointments = this.form.maxAppointments || 1
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (this.form.workType === 'SHIFT' && this.form.startTime >= this.form.endTime) {
          this.$modal.msgError('开始时间必须早于结束时间')
          return
        }
        const request = this.form.scheduleId ? updateSchedule(this.form) : addSchedule(this.form)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除该排班？').then(() => delSchedule(row.scheduleId)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    workTypeName(type) {
      return { SHIFT: '有排班', REST: '休息', ALL_DAY: '全天在岗' }[type] || type
    },
    workTypeTag(type) {
      return { SHIFT: 'success', REST: 'info', ALL_DAY: 'primary' }[type] || ''
    },
    userLabel(item) {
      return [item.nickName, item.postName, item.deptName].filter(Boolean).join(' / ')
    }
  }
}
</script>
