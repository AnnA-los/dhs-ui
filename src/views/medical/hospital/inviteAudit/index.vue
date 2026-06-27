<template>
  <div class="app-container">
    <el-tabs v-model="activeStatus" @tab-click="handleTabClick">
      <el-tab-pane label="待审核" name="PENDING" />
      <el-tab-pane label="审核通过" name="APPROVED" />
      <el-tab-pane label="审核拒绝" name="REJECTED" />
    </el-tabs>

    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="申请人" prop="applicantKeyword">
        <el-input v-model="queryParams.applicantKeyword" placeholder="姓名/手机号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="邀请码" prop="inviteCode">
        <el-input v-model="queryParams.inviteCode" placeholder="请输入邀请码" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>

    <el-table v-loading="loading" :data="applyList" :height="tableHeight" border fit>
      <el-table-column label="申请人" min-width="140" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.applicantName || scope.row.applicantUserName || '-' }}</template>
      </el-table-column>
      <el-table-column label="手机号" prop="applicantPhone" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.applicantPhone || '-' }}</template>
      </el-table-column>
      <el-table-column label="邀请人" prop="inviterUserName" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.inviterUserName || '-' }}</template>
      </el-table-column>
      <el-table-column label="邀请码" prop="inviteCode" min-width="120" show-overflow-tooltip />
      <el-table-column label="部门" prop="deptName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
      </el-table-column>
      <el-table-column label="岗位" prop="postName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.postName || '-' }}</template>
      </el-table-column>
      <el-table-column label="角色" prop="roleNames" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.roleNames || '-' }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="auditStatus" width="100">
        <template slot-scope="scope">
          <el-tag :type="auditStatusTag(scope.row.auditStatus)" size="mini">{{ auditStatusName(scope.row.auditStatus) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column v-if="activeStatus !== 'PENDING'" label="审核时间" prop="auditTime" width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.auditTime) || '-' }}</template>
      </el-table-column>
      <el-table-column v-if="activeStatus === 'REJECTED'" label="拒绝原因" prop="rejectReason" min-width="180" show-overflow-tooltip />
      <el-table-column v-if="activeStatus === 'PENDING'" label="操作" align="center" width="140">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-check" @click="handleApprove(scope.row)" v-hasPermi="['medical:inviteApply:audit']">通过</el-button>
          <el-button type="text" size="mini" icon="el-icon-close" @click="handleReject(scope.row)" v-hasPermi="['medical:inviteApply:audit']">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="审核通过" :visible.sync="approveOpen" width="580px" append-to-body>
      <el-form ref="approveForm" :model="approveForm" :rules="approveRules" label-width="96px">
        <el-form-item label="申请人">
          <span>{{ currentApply.applicantName || currentApply.applicantUserName || '-' }} {{ currentApply.applicantPhone || '' }}</span>
        </el-form-item>
        <el-form-item label="用户角色" prop="roleIds">
          <el-select v-model="approveForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户部门" prop="deptId">
          <el-select v-model="approveForm.deptId" placeholder="请选择部门" clearable style="width: 100%">
            <el-option v-for="dept in deptOptions" :key="dept.deptId" :label="dept.deptName" :value="dept.deptId" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户岗位" prop="postId">
          <el-select v-model="approveForm.postId" filterable remote clearable placeholder="请选择岗位" :remote-method="remotePosts" :loading="postLoading" style="width: 100%">
            <el-option v-for="post in postOptions" :key="post.postId" :label="post.postName" :value="post.postId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitApprove">确 定</el-button>
        <el-button @click="approveOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="审核拒绝" :visible.sync="rejectOpen" width="560px" append-to-body>
      <el-form ref="rejectForm" :model="rejectForm" :rules="rejectRules" label-width="96px">
        <el-form-item label="申请人">
          <span>{{ currentApply.applicantName || currentApply.applicantUserName || '-' }} {{ currentApply.applicantPhone || '' }}</span>
        </el-form-item>
        <el-form-item label="拒绝原因" prop="rejectReason">
          <el-input v-model="rejectForm.rejectReason" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="请输入拒绝原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :loading="submitLoading" @click="submitReject">确 定</el-button>
        <el-button @click="rejectOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listInviteApply, approveInviteApply, rejectInviteApply } from '@/api/medical/hospitalInviteApply'
import { listHospitalRole } from '@/api/medical/hospitalRole'
import { listHospitalDept } from '@/api/medical/hospitalDept'
import { hospitalPostOptions } from '@/api/medical/hospitalPost'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalHospitalInviteAudit',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      submitLoading: false,
      postLoading: false,
      showSearch: true,
      activeStatus: 'PENDING',
      total: 0,
      applyList: [],
      roleOptions: [],
      deptOptions: [],
      postOptions: [],
      approveOpen: false,
      rejectOpen: false,
      currentApply: {},
      queryParams: { pageNum: 1, pageSize: 10, auditStatus: 'PENDING', applicantKeyword: undefined, inviteCode: undefined },
      approveForm: { roleIds: [], deptId: undefined, postId: undefined },
      rejectForm: { rejectReason: undefined },
      approveRules: {
        roleIds: [{ required: true, type: 'array', message: '用户角色不能为空', trigger: 'change' }],
        deptId: [{ required: true, message: '用户部门不能为空', trigger: 'change' }],
        postId: [{ required: true, message: '用户岗位不能为空', trigger: 'change' }]
      },
      rejectRules: {
        rejectReason: [{ required: true, message: '拒绝原因不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
    this.loadOptions()
  },
  methods: {
    getList() {
      this.loading = true
      this.queryParams.auditStatus = this.activeStatus
      listInviteApply(this.queryParams).then(response => {
        this.applyList = response.rows || response.data || []
        this.total = response.total || this.applyList.length
        this.loading = false
      }).catch(() => {
        this.applyList = []
        this.total = 0
        this.loading = false
      })
    },
    loadOptions() {
      listHospitalRole({ pageNum: 1, pageSize: 100 }).then(response => {
        this.roleOptions = response.rows || response.data || []
      })
      listHospitalDept().then(response => {
        this.deptOptions = response.data || response.rows || []
      })
      this.remotePosts('')
    },
    remotePosts(query) {
      this.postLoading = true
      hospitalPostOptions({ postName: query }).then(response => {
        this.postOptions = response.data || response.rows || []
        this.postLoading = false
      }).catch(() => {
        this.postOptions = []
        this.postLoading = false
      })
    },
    handleTabClick() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleApprove(row) {
      this.currentApply = row
      this.approveForm = { roleIds: [], deptId: undefined, postId: undefined }
      this.approveOpen = true
      this.$nextTick(() => this.resetForm('approveForm'))
    },
    handleReject(row) {
      this.currentApply = row
      this.rejectForm = { rejectReason: undefined }
      this.rejectOpen = true
      this.$nextTick(() => this.resetForm('rejectForm'))
    },
    submitApprove() {
      this.$refs.approveForm.validate(valid => {
        if (!valid) {
          return
        }
        this.submitLoading = true
        approveInviteApply(this.currentApply.applyId, this.approveForm).then(() => {
          this.$modal.msgSuccess('审核通过成功')
          this.approveOpen = false
          this.getList()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    submitReject() {
      this.$refs.rejectForm.validate(valid => {
        if (!valid) {
          return
        }
        this.submitLoading = true
        rejectInviteApply(this.currentApply.applyId, this.rejectForm).then(() => {
          this.$modal.msgSuccess('审核拒绝成功')
          this.rejectOpen = false
          this.getList()
        }).finally(() => {
          this.submitLoading = false
        })
      })
    },
    auditStatusName(status) {
      const map = { PENDING: '待审核', APPROVED: '审核通过', REJECTED: '审核拒绝' }
      return map[status] || status || '-'
    },
    auditStatusTag(status) {
      const map = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' }
      return map[status] || 'info'
    }
  }
}
</script>
