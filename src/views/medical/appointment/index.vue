<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="患者" prop="patientId">
        <el-input v-model="queryParams.patientId" placeholder="请输入患者" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="医生" prop="doctorUserId">
        <el-input v-model="queryParams.doctorUserId" placeholder="请输入医生" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="appointmentStatus">
        <el-select v-model="queryParams.appointmentStatus" placeholder="预约状态" clearable>
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
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="appointmentList" :height="tableHeight" border fit>
      <el-table-column label="患者" prop="patientName" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.patientName || '-' }}</template>
      </el-table-column>
      <el-table-column label="医生" prop="doctorName" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.doctorName || '-' }}</template>
      </el-table-column>
      <el-table-column label="部门" prop="deptName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
      </el-table-column>
      <el-table-column label="牙椅" prop="chairName" width="110">
        <template slot-scope="scope">{{ scope.row.chairName || '-' }}</template>
      </el-table-column>
      <el-table-column label="开始时间" prop="appointmentStart" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.appointmentStart) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" prop="appointmentEnd" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.appointmentEnd) }}</template>
      </el-table-column>
      <el-table-column label="就诊类型" prop="visitType" width="90">
        <template slot-scope="scope">{{ visitTypeName(scope.row.visitType) }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="appointmentStatus" width="100">
        <template slot-scope="scope">{{ statusName(scope.row.appointmentStatus) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="680px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="108px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="患者" prop="patientId">
              <el-input v-model="form.patientId" placeholder="请选择或输入患者" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生" prop="doctorUserId">
              <el-input v-model="form.doctorUserId" placeholder="请选择或输入医生" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="部门" prop="deptId">
              <el-input v-model="form.deptId" placeholder="请选择或输入部门" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="牙椅" prop="chairId">
              <el-input v-model="form.chairId" placeholder="请选择或输入牙椅" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="appointmentStart">
              <el-date-picker v-model="form.appointmentStart" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择开始时间" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="appointmentEnd">
              <el-date-picker v-model="form.appointmentEnd" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择结束时间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="就诊类型" prop="visitType">
              <el-select v-model="form.visitType" placeholder="请选择就诊类型">
                <el-option label="初诊" value="0" />
                <el-option label="复诊" value="1" />
                <el-option label="会诊" value="2" />
                <el-option label="急诊" value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约状态" prop="appointmentStatus">
              <el-select v-model="form.appointmentStatus" placeholder="请选择预约状态">
                <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="取消原因" prop="cancelReason">
          <el-input v-model="form.cancelReason" placeholder="请输入取消原因" />
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
  </div>
</template>

<script>
import { listAppointment, getAppointment, delAppointment, addAppointment, updateAppointment } from '@/api/medical/appointment'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalAppointment',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      appointmentList: [],
      title: '',
      open: false,
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
        appointmentStatus: undefined
      },
      form: {},
      rules: {
        patientId: [{ required: true, message: '患者不能为空', trigger: 'blur' }],
        doctorUserId: [{ required: true, message: '医生不能为空', trigger: 'blur' }],
        appointmentStart: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        appointmentEnd: [{ required: true, message: '结束时间不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listAppointment(this.queryParams).then(response => {
        this.appointmentList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        appointmentId: undefined,
        patientId: undefined,
        doctorUserId: undefined,
        visitType: '0',
        appointmentStatus: '0'
      }
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
        this.form = response.data
        this.open = true
        this.title = '修改预约'
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const request = this.form.appointmentId ? updateAppointment(this.form) : addAppointment(this.form)
          request.then(() => {
            this.$modal.msgSuccess(this.form.appointmentId ? '修改成功' : '新增成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除该预约？').then(function() {
        return delAppointment(row.appointmentId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    statusName(status) {
      const item = this.statusOptions.find(option => option.value === status)
      return item ? item.label : status
    },
    visitTypeName(type) {
      return { '0': '初诊', '1': '复诊', '2': '会诊', '3': '急诊' }[type] || type
    }
  }
}
</script>
