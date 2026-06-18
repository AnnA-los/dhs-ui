<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="患者" prop="patientId">
        <el-select v-model="queryParams.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading">
          <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="医生" prop="doctorUserId">
        <el-select v-model="queryParams.doctorUserId" filterable remote clearable placeholder="请选择医生" :remote-method="remoteQueryDoctors" :loading="queryDoctorLoading">
          <el-option v-for="item in queryDoctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="就诊类型" prop="appointmentTypeId">
        <el-select v-model="queryParams.appointmentTypeId" filterable clearable placeholder="请选择就诊类型">
          <el-option v-for="item in typeOptions" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="预约状态" prop="appointmentStatus">
        <el-select v-model="queryParams.appointmentStatus" filterable clearable placeholder="请选择预约状态">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
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
      <el-col :span="1.5">
        <el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen = true">预约类型</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appointmentList" :height="tableHeight" border fit>
      <el-table-column label="患者" prop="patientName" min-width="130" show-overflow-tooltip />
      <el-table-column label="手机号" prop="patientPhone" min-width="120" show-overflow-tooltip />
      <el-table-column label="预约部门" prop="deptName" min-width="130" show-overflow-tooltip />
      <el-table-column label="医生" prop="doctorName" min-width="130" show-overflow-tooltip />
      <el-table-column label="就诊类型" prop="appointmentTypeName" min-width="120" show-overflow-tooltip />
      <el-table-column label="开始时间" prop="appointmentStart" min-width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.appointmentStart) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" prop="appointmentEnd" min-width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.appointmentEnd) }}</template>
      </el-table-column>
      <el-table-column label="预约状态" prop="appointmentStatus" min-width="100">
        <template slot-scope="scope">{{ statusName(scope.row.appointmentStatus) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="760px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="患者" prop="patientName">
              <el-autocomplete
                v-model="form.patientName"
                clearable
                placeholder="请选择或输入患者"
                :fetch-suggestions="queryPatientSuggestions"
                style="width: 100%"
                @select="handlePatientSelect"
                @input="handlePatientInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="patientPhone">
              <el-input v-model="form.patientPhone" clearable placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="预约部门" prop="deptId">
              <el-select v-model="form.deptId" filterable clearable placeholder="请选择预约部门" style="width: 100%" @change="handleDeptChange">
                <el-option v-for="item in deptOptions" :key="item.deptId" :label="item.deptName" :value="item.deptId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生" prop="doctorUserId">
              <el-select
                v-model="form.doctorUserId"
                filterable
                remote
                clearable
                :disabled="!form.deptId"
                :placeholder="form.deptId ? '请选择医生' : '请先选择预约部门'"
                :remote-method="remoteFormDoctors"
                :loading="formDoctorLoading"
                style="width: 100%"
              >
                <el-option v-for="item in formDoctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="就诊类型" prop="appointmentTypeText">
              <el-autocomplete
                v-model="form.appointmentTypeText"
                clearable
                placeholder="请选择或输入就诊类型"
                :fetch-suggestions="queryTypeSuggestions"
                style="width: 100%"
                @select="handleTypeSelect"
                @input="handleTypeInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约状态" prop="appointmentStatus">
              <el-select v-model="form.appointmentStatus" placeholder="请选择预约状态" style="width: 100%">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="appointmentStart">
              <el-date-picker v-model="form.appointmentStart" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择开始时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="appointmentEnd">
              <el-date-picker v-model="form.appointmentEnd" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择结束时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="form.appointmentStatus === '5'" label="取消原因" prop="cancelReason">
          <el-input v-model="form.cancelReason" clearable placeholder="请输入取消原因" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <type-manage-dialog v-model="typeOpen" title="预约类型" type-category="VISIT" @saved="loadTypes" />
  </div>
</template>

<script>
import { listAppointment, getAppointment, delAppointment, addAppointment, updateAppointment } from '@/api/medical/appointment'
import { patientOptions as queryPatients } from '@/api/medical/patient'
import { doctorOptions as queryDoctors } from '@/api/medical/hospitalUser'
import { listHospitalDept } from '@/api/medical/hospitalDept'
import { medicalTypeOptions } from '@/api/medical/type'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'

export default {
  name: 'MedicalAppointment',
  components: { TypeManageDialog },
  mixins: [medicalTableHeight],
  data() {
    const checkTimeRange = (rule, value, callback) => {
      if (this.form.appointmentStart && this.form.appointmentEnd && this.form.appointmentStart > this.form.appointmentEnd) {
        callback(new Error('开始时间不能晚于结束时间'))
        return
      }
      callback()
    }
    const checkCancelReason = (rule, value, callback) => {
      if (this.form.appointmentStatus === '5' && !value) {
        callback(new Error('取消原因不能为空'))
        return
      }
      callback()
    }
    return {
      loading: true,
      showSearch: true,
      patientLoading: false,
      queryDoctorLoading: false,
      formDoctorLoading: false,
      total: 0,
      appointmentList: [],
      patientOptions: [],
      queryDoctorOptions: [],
      formDoctorOptions: [],
      deptOptions: [],
      typeOptions: [],
      title: '',
      open: false,
      typeOpen: false,
      statusOptions: [
        { label: '待确认', value: '0' },
        { label: '已确认', value: '1' },
        { label: '已签到', value: '2' },
        { label: '接诊中', value: '3' },
        { label: '已完成', value: '4' },
        { label: '已取消', value: '5' },
        { label: '爽约', value: '6' }
      ],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        patientId: undefined,
        doctorUserId: undefined,
        appointmentTypeId: undefined,
        appointmentStatus: undefined
      },
      form: {},
      rules: {
        patientName: [{ required: true, message: '患者不能为空', trigger: 'change' }],
        patientPhone: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
        deptId: [{ required: true, message: '预约部门不能为空', trigger: 'change' }],
        doctorUserId: [{ required: true, message: '医生不能为空', trigger: 'change' }],
        appointmentTypeText: [{ required: true, message: '就诊类型不能为空', trigger: 'change' }],
        appointmentStatus: [{ required: true, message: '预约状态不能为空', trigger: 'change' }],
        appointmentStart: [
          { required: true, message: '开始时间不能为空', trigger: 'change' },
          { validator: checkTimeRange, trigger: 'change' }
        ],
        appointmentEnd: [
          { required: true, message: '结束时间不能为空', trigger: 'change' },
          { validator: checkTimeRange, trigger: 'change' }
        ],
        cancelReason: [{ validator: checkCancelReason, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.remotePatients('')
    this.remoteQueryDoctors('')
    this.loadDepts()
    this.loadTypes()
  },
  methods: {
    getList() {
      this.loading = true
      listAppointment(this.queryParams).then(response => {
        this.appointmentList = response.rows || []
        this.total = response.total || 0
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    loadDepts() {
      listHospitalDept({ pageNum: 1, pageSize: 999 }).then(response => {
        this.deptOptions = response.rows || []
      })
    },
    loadTypes() {
      medicalTypeOptions({ typeCategory: 'VISIT' }).then(response => {
        this.typeOptions = response.data || []
      })
    },
    remotePatients(query) {
      this.patientLoading = true
      queryPatients({ patientName: query }).then(response => {
        this.patientOptions = response.data || []
        this.patientLoading = false
      }).catch(() => {
        this.patientLoading = false
      })
    },
    remoteQueryDoctors(query) {
      this.queryDoctorLoading = true
      queryDoctors({ nickName: query }).then(response => {
        this.queryDoctorOptions = response.data || []
        this.queryDoctorLoading = false
      }).catch(() => {
        this.queryDoctorLoading = false
      })
    },
    remoteFormDoctors(query) {
      if (!this.form.deptId) {
        this.formDoctorOptions = []
        return
      }
      this.formDoctorLoading = true
      queryDoctors({ nickName: query, deptId: this.form.deptId }).then(response => {
        this.formDoctorOptions = response.data || []
        this.formDoctorLoading = false
      }).catch(() => {
        this.formDoctorLoading = false
      })
    },
    queryPatientSuggestions(queryString, cb) {
      queryPatients({ patientName: queryString }).then(response => {
        const list = (response.data || []).map(item => ({
          value: item.patientName,
          patientId: item.patientId,
          patientName: item.patientName,
          patientPhone: item.phone
        }))
        cb(list)
      })
    },
    handlePatientSelect(item) {
      this.form.patientId = item.patientId
      this.form.patientName = item.patientName
      this.form.patientPhone = item.patientPhone
    },
    handlePatientInput() {
      this.form.patientId = undefined
    },
    queryTypeSuggestions(queryString, cb) {
      const keyword = (queryString || '').toLowerCase()
      cb(this.typeOptions
        .filter(item => !keyword || item.typeName.toLowerCase().includes(keyword))
        .map(item => ({ value: item.typeName, typeId: item.typeId })))
    },
    handleTypeSelect(item) {
      this.form.appointmentTypeId = item.typeId
      this.form.appointmentTypeText = item.value
    },
    handleTypeInput() {
      this.form.appointmentTypeId = undefined
    },
    handleDeptChange() {
      this.form.doctorUserId = undefined
      this.formDoctorOptions = []
      this.remoteFormDoctors('')
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        appointmentId: undefined,
        patientId: undefined,
        patientName: undefined,
        patientPhone: undefined,
        deptId: undefined,
        doctorUserId: undefined,
        appointmentTypeId: undefined,
        appointmentTypeText: undefined,
        appointmentStatus: '0',
        cancelReason: undefined,
        remark: undefined
      }
      this.formDoctorOptions = []
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
      this.open = true
      this.title = '新增预约'
    },
    handleUpdate(row) {
      this.reset()
      getAppointment(row.appointmentId).then(response => {
        this.form = response.data || {}
        this.form.appointmentTypeText = this.form.appointmentTypeName
        this.open = true
        this.title = '修改预约'
        this.remoteFormDoctors('')
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const request = this.form.appointmentId ? updateAppointment(this.form) : addAppointment(this.form)
        request.then(() => {
          this.$modal.msgSuccess(this.form.appointmentId ? '修改成功' : '新增成功')
          this.open = false
          this.getList()
          this.loadTypes()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除该预约？').then(() => delAppointment(row.appointmentId)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    statusName(status) {
      const item = this.statusOptions.find(option => option.value === status)
      return item ? item.label : status
    }
  }
}
</script>
