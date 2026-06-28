<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="员工" prop="hospitalUserId">
        <el-select v-model="queryParams.hospitalUserId" filterable remote clearable placeholder="请选择员工" :remote-method="remoteUsers" :loading="userLoading">
          <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="userName(item)" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="排班类型" prop="workType">
        <el-select v-model="queryParams.workType" clearable placeholder="请选择排班类型">
          <el-option v-for="item in workTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="排班日期">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="dateRangePickerOptions"
          @change="handleDateRangeChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5"><el-button v-hasPermi="['medical:schedule:add']" type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button></el-col>
      <el-col :span="1.5"><el-button v-hasPermi="['medical:schedule:businessHours:query', 'medical:schedule:add', 'medical:schedule:edit']" type="info" plain icon="el-icon-time" size="mini" @click="handleBusinessHours">营业时间</el-button></el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="scheduleList" :height="tableHeight" border fit>
      <el-table-column label="员工" prop="hospitalUserName" min-width="120" show-overflow-tooltip />
      <el-table-column label="手机号" prop="phonenumber" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ schedulePhone(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="部门" prop="deptName" min-width="120" show-overflow-tooltip />
      <el-table-column label="岗位" prop="postName" min-width="110" show-overflow-tooltip />
      <el-table-column label="排班日期" prop="scheduleDate" min-width="120">
        <template slot-scope="scope">{{ scope.row.workType === 'BUSINESS_PERIOD' ? '长期有效' : parseTime(scope.row.scheduleDate, '{y}-{m}-{d}') }}</template>
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
      <el-table-column label="超营业标记" prop="outOfBusinessHours" min-width="110">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.outOfBusinessHours === '1'" type="warning">超营业时间</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
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

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="96px">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="员工" prop="hospitalUserId">
              <el-select v-model="form.hospitalUserId" filterable remote clearable placeholder="请选择员工" :remote-method="remoteUsers" :loading="userLoading" style="width: 100%" @change="handleUserChange">
                <el-option v-for="item in userOptions" :key="item.hospitalUserId" :label="userName(item)" :value="item.hospitalUserId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="form.phonenumber" disabled placeholder="选择员工后自动带出" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.workType !== 'BUSINESS_PERIOD'" label="排班日期" prop="scheduleDateRange">
          <el-date-picker
            v-model="form.scheduleDateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="dateRangePickerOptions"
            style="width: 100%"
            @change="handleScheduleDateRangeChange"
          />
        </el-form-item>
        <el-form-item label="排班类型" prop="workType">
          <el-radio-group v-model="form.workType" @change="handleWorkTypeChange">
            <el-radio-button label="SHIFT">有排班</el-radio-button>
            <el-radio-button label="REST">休息</el-radio-button>
            <el-radio-button label="ALL_DAY">全天在岗</el-radio-button>
            <el-radio-button label="BUSINESS_PERIOD">营业期间在岗</el-radio-button>
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
        <el-button type="primary" :loading="submitLoading" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="营业时间" :visible.sync="businessHoursOpen" width="620px" append-to-body>
      <el-form ref="businessHoursForm" :model="businessHoursForm" :rules="businessHoursRules" label-width="112px" v-loading="businessHoursLoading">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="营业开始" prop="openTime">
              <el-time-picker v-model="businessHoursForm.openTime" value-format="HH:mm" format="HH:mm" placeholder="开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业结束" prop="closeTime">
              <el-time-picker v-model="businessHoursForm.closeTime" value-format="HH:mm" format="HH:mm" placeholder="结束时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="营业日期规则" prop="dateRule">
          <el-select v-model="businessHoursForm.dateRule" placeholder="请选择营业日期规则" style="width: 100%">
            <el-option v-for="item in dateRuleOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="businessHoursForm.dateRule === 'WEEKLY_REST'" label="每周休息">
          <el-checkbox-group v-model="businessHoursForm.weeklyRestDayValues">
            <el-checkbox v-for="item in weekDayOptions" :key="item.value" :label="item.value">{{ item.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="businessHoursForm.dateRule === 'MONTHLY_REST'" label="每月休息">
          <el-select v-model="businessHoursForm.monthlyRestDayValues" multiple collapse-tags placeholder="请选择休息日期" style="width: 100%">
            <el-option v-for="item in monthDayOptions" :key="item" :label="item + '号'" :value="String(item)" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="businessHoursForm.remark" type="textarea" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="businessHoursSaving" @click="submitBusinessHours">保 存</el-button>
        <el-button @click="businessHoursOpen=false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSchedule, getSchedule, addSchedule, updateSchedule, delSchedule, getScheduleBusinessHours, saveScheduleBusinessHours } from '@/api/medical/schedule'
import { scheduleUserOptions } from '@/api/medical/hospitalUser'
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
      submitLoading: false,
      businessHoursOpen: false,
      businessHoursLoading: false,
      businessHoursSaving: false,
      scheduleList: [],
      userOptions: [],
      dateRange: this.getRecentMonthRange(),
      dateRangePickerOptions: this.getCommonDateRangePickerOptions(false),
      queryParams: { pageNum: 1, pageSize: 10, hospitalUserId: undefined, workType: undefined, params: {} },
      form: {},
      businessHoursForm: {},
      intervalOptions: [10, 15, 20, 30, 60],
      workTypeOptions: [
        { label: '有排班', value: 'SHIFT' },
        { label: '休息', value: 'REST' },
        { label: '全天在岗', value: 'ALL_DAY' },
        { label: '营业期间在岗', value: 'BUSINESS_PERIOD' }
      ],
      dateRuleOptions: [
        { label: '全年营业', value: 'ALL_YEAR' },
        { label: '按国家法定规则休息', value: 'NATIONAL_HOLIDAY' },
        { label: '每周休息', value: 'WEEKLY_REST' },
        { label: '每月休息', value: 'MONTHLY_REST' }
      ],
      weekDayOptions: [
        { label: '周一', value: '1' },
        { label: '周二', value: '2' },
        { label: '周三', value: '3' },
        { label: '周四', value: '4' },
        { label: '周五', value: '5' },
        { label: '周六', value: '6' },
        { label: '周日', value: '7' }
      ],
      monthDayOptions: Array.from({ length: 31 }, (_, index) => index + 1),
      rules: {
        hospitalUserId: [{ required: true, message: '员工不能为空', trigger: 'change' }],
        workType: [{ required: true, message: '排班类型不能为空', trigger: 'change' }],
        startTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
      },
      businessHoursRules: {
        openTime: [{ required: true, message: '营业开始时间不能为空', trigger: 'change' }],
        closeTime: [{ required: true, message: '营业结束时间不能为空', trigger: 'change' }],
        dateRule: [{ required: true, message: '营业日期规则不能为空', trigger: 'change' }]
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
      }).catch(() => {
        this.loading = false
      })
    },
    remoteUsers(query) {
      this.userLoading = true
      scheduleUserOptions({ nickName: query }).then(response => {
        this.userOptions = this.mergeUserOptions(response.data || response.rows || [])
        this.userLoading = false
      }).catch(() => {
        this.userLoading = false
      })
    },
    reset() {
      this.form = { workType: 'SHIFT', appointmentInterval: 30, maxAppointments: 1, scheduleDateRange: undefined, phonenumber: undefined }
      this.resetForm('form')
    },
    resetBusinessHours() {
      this.businessHoursForm = {
        openTime: '09:00',
        closeTime: '18:00',
        dateRule: 'ALL_YEAR',
        weeklyRestDayValues: [],
        monthlyRestDayValues: [],
        status: '0'
      }
      this.resetForm('businessHoursForm')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = this.getRecentMonthRange()
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleDateRangeChange(value) {
      if (this.isDateRangeOverOneYear(value)) {
        this.$modal.msgError('时间范围不能超过一年')
        this.dateRange = this.getRecentMonthRange()
      } else {
        this.dateRange = this.restoreRecentMonthRange(value)
      }
      this.handleQuery()
    },
    handleScheduleDateRangeChange(value) {
      if (this.isDateRangeOverOneYear(value)) {
        this.$modal.msgError('排班日期范围不能超过一年')
        this.form.scheduleDateRange = undefined
      }
    },
    handleAdd() {
      this.reset()
      this.title = '新增排班'
      this.open = true
    },
    handleUpdate(row) {
      this.reset()
      getSchedule(row.scheduleId).then(response => {
        const data = response.data || {}
        const scheduleDate = this.parseTime(data.scheduleDate || row.scheduleDate, '{y}-{m}-{d}')
        this.form = Object.assign({}, data, {
          scheduleDateRange: [
            data.scheduleBeginDate || scheduleDate,
            data.scheduleEndDate || scheduleDate
          ],
          phonenumber: this.resolveSchedulePhone(data) || this.resolveSchedulePhone(row)
        })
        this.userOptions = this.mergeUserOptions([])
        this.title = '修改排班'
        this.open = true
      })
    },
    handleBusinessHours() {
      this.resetBusinessHours()
      this.businessHoursOpen = true
      this.businessHoursLoading = true
      getScheduleBusinessHours().then(response => {
        const data = response.data || {}
        this.businessHoursForm = Object.assign({}, this.businessHoursForm, data, {
          openTime: this.normalizeMinuteTime(data.openTime) || this.businessHoursForm.openTime,
          closeTime: this.normalizeMinuteTime(data.closeTime) || this.businessHoursForm.closeTime,
          weeklyRestDayValues: this.splitValues(data.weeklyRestDays),
          monthlyRestDayValues: this.splitValues(data.monthlyRestDays)
        })
        this.businessHoursLoading = false
      }).catch(() => {
        this.businessHoursLoading = false
      })
    },
    handleUserChange(value) {
      const user = this.userOptions.find(item => item.hospitalUserId === value)
      this.form.phonenumber = user ? this.resolveSchedulePhone(user) : undefined
    },
    handleWorkTypeChange(value) {
      if (value !== 'SHIFT') {
        this.form.startTime = undefined
        this.form.endTime = undefined
        this.form.appointmentInterval = undefined
        this.form.maxAppointments = undefined
        if (value === 'BUSINESS_PERIOD') {
          this.form.scheduleDateRange = undefined
        }
      } else {
        this.form.appointmentInterval = this.form.appointmentInterval || 30
        this.form.maxAppointments = this.form.maxAppointments || 1
      }
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.validateScheduleForm()) return
        this.doSubmitForm(false)
      })
    },
    doSubmitForm(businessHoursConfirmed) {
      const data = this.buildSchedulePayload(businessHoursConfirmed)
      const request = data.scheduleId ? updateSchedule(data) : addSchedule(data)
      this.submitLoading = true
      request.then(() => {
        this.$modal.msgSuccess('保存成功')
        this.open = false
        this.submitLoading = false
        this.getList()
      }).catch(error => {
        this.submitLoading = false
        if (!businessHoursConfirmed && this.isBusinessHoursConfirmError(error)) {
          this.confirmOutOfBusinessHours()
        }
      })
    },
    confirmOutOfBusinessHours() {
      this.$confirm('当前排班时间超出医院营业时间或休息规则，是否继续保存并标记为超营业时间排班？', '超营业时间确认', {
        confirmButtonText: '继续保存',
        cancelButtonText: '返回修改',
        type: 'warning'
      }).then(() => {
        this.doSubmitForm(true)
      }).catch(() => {})
    },
    submitBusinessHours() {
      this.$refs.businessHoursForm.validate(valid => {
        if (!valid) return
        if (this.businessHoursForm.openTime >= this.businessHoursForm.closeTime) {
          this.$modal.msgError('营业开始时间必须早于营业结束时间')
          return
        }
        const data = Object.assign({}, this.businessHoursForm, {
          weeklyRestDays: this.businessHoursForm.dateRule === 'WEEKLY_REST' ? this.businessHoursForm.weeklyRestDayValues.join(',') : undefined,
          monthlyRestDays: this.businessHoursForm.dateRule === 'MONTHLY_REST' ? this.businessHoursForm.monthlyRestDayValues.join(',') : undefined
        })
        delete data.weeklyRestDayValues
        delete data.monthlyRestDayValues
        this.businessHoursSaving = true
        saveScheduleBusinessHours(data).then(() => {
          this.$modal.msgSuccess('营业时间保存成功')
          this.businessHoursOpen = false
          this.businessHoursSaving = false
          this.getList()
        }).catch(() => {
          this.businessHoursSaving = false
        })
      })
    },
    validateScheduleForm() {
      if (this.isDateRangeOverOneYear(this.form.scheduleDateRange)) {
        this.$modal.msgError('排班日期范围不能超过一年')
        return false
      }
      if (this.form.workType !== 'BUSINESS_PERIOD' && (!Array.isArray(this.form.scheduleDateRange) || this.form.scheduleDateRange.length !== 2)) {
        this.$modal.msgError('排班日期不能为空')
        return false
      }
      if (this.form.workType === 'SHIFT' && this.form.startTime >= this.form.endTime) {
        this.$modal.msgError('开始时间必须早于结束时间')
        return false
      }
      return true
    },
    buildSchedulePayload(businessHoursConfirmed) {
      const dateRange = this.form.scheduleDateRange || []
      const data = Object.assign({}, this.form, {
        scheduleBeginDate: this.form.workType === 'BUSINESS_PERIOD' ? undefined : dateRange[0],
        scheduleEndDate: this.form.workType === 'BUSINESS_PERIOD' ? undefined : dateRange[1],
        scheduleDate: this.form.workType === 'BUSINESS_PERIOD' ? undefined : dateRange[0]
      })
      if (businessHoursConfirmed) {
        data.businessHoursConfirmed = true
      } else {
        delete data.businessHoursConfirmed
      }
      delete data.scheduleDateRange
      delete data.phonenumber
      delete data.phoneNumber
      delete data.hospitalUserName
      delete data.deptName
      delete data.postName
      return data
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除该排班？').then(() => delSchedule(row.scheduleId)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    restoreRecentMonthRange(value) {
      if (Array.isArray(value) && value.length === 2) {
        return value
      }
      return this.getRecentMonthRange()
    },
    isDateRangeOverOneYear(value) {
      if (!Array.isArray(value) || value.length !== 2) return false
      const start = new Date(value[0].replace(/-/g, '/')).getTime()
      const end = new Date(value[1].replace(/-/g, '/')).getTime()
      return end - start > 366 * 24 * 60 * 60 * 1000
    },
    isBusinessHoursConfirmError(error) {
      const message = error && error.message ? error.message : String(error || '')
      return message.includes('营业时间') || message.includes('超出营业') || message.includes('休息日')
    },
    currentUserOption() {
      if (!this.form || !this.form.hospitalUserId) return null
      return {
        hospitalUserId: this.form.hospitalUserId,
        nickName: this.form.hospitalUserName,
        phonenumber: this.form.phonenumber || this.form.phoneNumber || this.form.hospitalUserPhone
      }
    },
    mergeUserOptions(options) {
      const map = {}
      const result = []
      const current = this.currentUserOption()
      ;[current].concat(options || []).forEach(item => {
        if (item && item.hospitalUserId && !map[item.hospitalUserId]) {
          map[item.hospitalUserId] = true
          result.push(item)
        }
      })
      return result
    },
    splitValues(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.map(item => String(item))
      return String(value).split(',').filter(Boolean)
    },
    normalizeMinuteTime(value) {
      if (!value) return value
      return String(value).slice(0, 5)
    },
    workTypeName(type) {
      return { SHIFT: '有排班', REST: '休息', ALL_DAY: '全天在岗', BUSINESS_PERIOD: '营业期间在岗' }[type] || type
    },
    workTypeTag(type) {
      return { SHIFT: 'success', REST: 'info', ALL_DAY: 'primary', BUSINESS_PERIOD: 'warning' }[type] || ''
    },
    userName(item) {
      return item.nickName || item.userName || item.hospitalUserName || '-'
    },
    schedulePhone(item) {
      return this.resolveSchedulePhone(item) || '-'
    },
    resolveSchedulePhone(item) {
      return item && (item.hospitalUserPhone || item.phonenumber || item.phoneNumber)
    }
  }
}
</script>
