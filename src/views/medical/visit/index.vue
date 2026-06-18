<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="病历编号" prop="visitNo">
        <el-input v-model="queryParams.visitNo" placeholder="请输入病历编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="患者" prop="patientId">
        <el-select v-model="queryParams.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading">
          <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
        </el-select>
      </el-form-item>
      <el-form-item label="医生" prop="doctorUserId">
        <el-select v-model="queryParams.doctorUserId" filterable remote clearable placeholder="请选择医生" :remote-method="remoteDoctors" :loading="doctorLoading">
          <el-option v-for="item in doctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
        </el-select>
      </el-form-item>
      <el-form-item label="病历类型" prop="visitTypeId">
        <el-select v-model="queryParams.visitTypeId" filterable clearable placeholder="请选择病历类型">
          <el-option v-for="item in typeOptions" :key="item.typeId" :label="item.typeName" :value="item.typeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="接诊时间">
        <el-date-picker v-model="visitTimeRange" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
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
        <el-button plain icon="el-icon-collection-tag" size="mini" @click="typeOpen=true">病历类型</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="visitList" :height="tableHeight" border fit>
      <el-table-column label="病历编号" prop="visitNo" min-width="170" show-overflow-tooltip />
      <el-table-column label="患者" prop="patientName" min-width="130" show-overflow-tooltip />
      <el-table-column label="医生" prop="doctorName" min-width="130" show-overflow-tooltip />
      <el-table-column label="病历类型" prop="visitTypeName" min-width="120" show-overflow-tooltip />
      <el-table-column label="接诊时间" prop="visitTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.visitTime) }}</template>
      </el-table-column>
      <el-table-column label="主诉" prop="chiefComplaint" min-width="170" show-overflow-tooltip />
      <el-table-column label="诊断" prop="diagnosis" min-width="170" show-overflow-tooltip />
      <el-table-column label="状态" prop="recordStatus" width="90">
        <template slot-scope="scope">{{ recordStatusName(scope.row.recordStatus) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="210">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-document" @click="handleDetail(scope.row)">详情</el-button>
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
            <el-form-item label="患者" prop="patientId">
              <el-select v-model="form.patientId" filterable remote clearable placeholder="请选择患者" :remote-method="remotePatients" :loading="patientLoading" style="width: 100%">
                <el-option v-for="item in patientOptions" :key="item.patientId" :label="item.patientName" :value="item.patientId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医生" prop="doctorUserId">
              <el-select v-model="form.doctorUserId" filterable remote clearable placeholder="请选择医生" :remote-method="remoteDoctors" :loading="doctorLoading" style="width: 100%">
                <el-option v-for="item in doctorOptions" :key="item.hospitalUserId" :label="item.nickName" :value="item.hospitalUserId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="病历类型" prop="visitTypeText">
              <el-autocomplete
                v-model="form.visitTypeText"
                clearable
                placeholder="请选择或输入病历类型"
                :fetch-suggestions="queryTypeSuggestions"
                style="width: 100%"
                @select="handleTypeSelect"
                @input="handleTypeInput"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接诊时间">
              <el-date-picker v-model="form.visitTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" placeholder="请选择接诊时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="主诉"><el-input v-model="form.chiefComplaint" type="textarea" /></el-form-item>
        <el-form-item label="诊断"><el-input v-model="form.diagnosis" type="textarea" /></el-form-item>
        <el-form-item label="治疗计划"><el-input v-model="form.treatmentPlan" type="textarea" /></el-form-item>
        <el-form-item label="影像资料"><image-upload v-model="form.imageUrls" :limit="5" /></el-form-item>
        <el-form-item label="病历状态">
          <el-select v-model="form.recordStatus" style="width: 220px">
            <el-option label="草稿" value="0" />
            <el-option label="已提交" value="1" />
            <el-option label="已归档" value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open=false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="病历详情" :visible.sync="detailOpen" width="860px" append-to-body class="visit-detail-dialog">
      <visit-paper-detail :visit="detailVisit" />
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-goods" @click="handleUsage(detailVisit)">收费明细</el-button>
        <el-button @click="detailOpen=false">关 闭</el-button>
      </div>
    </el-dialog>
    <type-manage-dialog v-model="typeOpen" title="病历类型" type-category="VISIT" @saved="loadTypes" />
  </div>
</template>

<script>
import { listVisit, getVisit, addVisit, updateVisit, delVisit } from '@/api/medical/visit'
import { patientOptions as queryPatients } from '@/api/medical/patient'
import { doctorOptions as queryDoctors } from '@/api/medical/hospitalUser'
import { medicalTypeOptions } from '@/api/medical/type'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'
import VisitPaperDetail from '@/views/medical/components/VisitPaperDetail'
import TypeManageDialog from '@/views/medical/components/TypeManageDialog'

export default {
  name: 'MedicalVisit',
  components: { VisitPaperDetail, TypeManageDialog },
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      patientLoading: false,
      doctorLoading: false,
      total: 0,
      visitList: [],
      patientOptions: [],
      doctorOptions: [],
      typeOptions: [],
      visitTimeRange: [],
      open: false,
      typeOpen: false,
      detailOpen: false,
      detailVisit: {},
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, visitNo: undefined, patientId: undefined, doctorUserId: undefined, visitTypeId: undefined, params: {} },
      form: {},
      rules: {
        patientId: [{ required: true, message: '患者不能为空', trigger: 'change' }],
        doctorUserId: [{ required: true, message: '医生不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.remotePatients('')
    this.remoteDoctors('')
    this.loadTypes()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.params = {
        beginTime: this.visitTimeRange && this.visitTimeRange.length ? this.visitTimeRange[0] : undefined,
        endTime: this.visitTimeRange && this.visitTimeRange.length ? this.visitTimeRange[1] : undefined
      }
      listVisit(this.queryParams).then(r => {
        this.visitList = r.rows
        this.total = r.total
        this.loading = false
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
      })
    },
    remoteDoctors(query) {
      this.doctorLoading = true
      queryDoctors({ nickName: query }).then(response => {
        this.doctorOptions = response.data || []
        this.doctorLoading = false
      })
    },
    reset() {
      this.form = { recordStatus: '0', imageUrls: undefined }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.visitTimeRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    queryTypeSuggestions(queryString, cb) {
      const keyword = (queryString || '').toLowerCase()
      cb(this.typeOptions
        .filter(item => !keyword || item.typeName.toLowerCase().includes(keyword))
        .map(item => ({ value: item.typeName, typeId: item.typeId })))
    },
    handleTypeSelect(item) {
      this.form.visitTypeId = item.typeId
      this.form.visitTypeText = item.value
    },
    handleTypeInput() {
      this.form.visitTypeId = undefined
    },
    handleAdd() {
      this.reset()
      this.title = '新增接诊病历'
      this.open = true
    },
    handleUpdate(row) {
      getVisit(row.visitId).then(r => {
        this.form = r.data
        this.form.visitTypeText = r.data.visitTypeName
        this.title = '修改接诊病历'
        this.open = true
      })
    },
    handleDetail(row) {
      getVisit(row.visitId).then(r => {
        this.detailVisit = r.data
        this.detailOpen = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        const req = this.form.visitId ? updateVisit(this.form) : addVisit(this.form)
        req.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
          this.loadTypes()
        })
      })
    },
    handleUsage(row) {
      if (!row.visitId) {
        this.$modal.msgWarning('请先保存病历')
        return
      }
      this.$router.push({ path: '/medical/visitUsage', query: { visitId: row.visitId }})
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除接诊记录？').then(() => delVisit(row.visitId)).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    recordStatusName(status) {
      return { '0': '草稿', '1': '已提交', '2': '已归档' }[status] || status
    }
  }
}
</script>
