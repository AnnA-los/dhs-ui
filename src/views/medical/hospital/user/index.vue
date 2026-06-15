<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户" prop="uid">
        <el-input v-model="queryParams.uid" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" clearable>
          <el-option label="正常" value="0" />
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

    <el-table v-loading="loading" :data="userList" :height="tableHeight" border fit>
      <el-table-column label="用户" prop="nickName" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.nickName || scope.row.userName || '-' }}</template>
      </el-table-column>
      <el-table-column label="部门" prop="deptName" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
      </el-table-column>
      <el-table-column label="邀请人" prop="inviterUserName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.inviterUserName || '-' }}</template>
      </el-table-column>
      <el-table-column label="owner" prop="isAdmin" width="80">
        <template slot-scope="scope">{{ scope.row.isAdmin === '1' ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="角色层级" prop="roleLevel" width="110">
        <template slot-scope="scope">{{ roleLevelName(scope.row.roleLevel, scope.row.isAdmin) }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="90">
        <template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" min-width="170">
        <template slot-scope="scope">{{ parseTime(scope.row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="210">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-edit" :disabled="isOwner(scope.row)" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" icon="el-icon-key" :disabled="isOwner(scope.row)" @click="handleRole(scope.row)">角色</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" :disabled="isOwner(scope.row)" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名称" prop="nickName"><el-input v-model="form.nickName" /></el-form-item>
        <template v-if="!form.hospitalUserId">
          <el-form-item label="手机号码"><el-input v-model="form.phonenumber" /></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
          <el-form-item label="登录密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        </template>
        <el-form-item label="用户角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户部门" prop="deptId">
          <el-select v-model="form.deptId" placeholder="请选择部门" clearable style="width: 100%">
            <el-option v-for="dept in deptOptions" :key="dept.deptId" :label="dept.deptName" :value="dept.deptId" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="分配医院角色" :visible.sync="roleOpen" width="520px" append-to-body>
      <el-checkbox-group v-model="roleForm.roleIds">
        <el-checkbox v-for="role in roleOptions" :key="role.roleId" :label="role.roleId">{{ role.roleName }}</el-checkbox>
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRoles">确 定</el-button>
        <el-button @click="roleOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listHospitalUser, getHospitalUser, addHospitalUser, updateHospitalUser, delHospitalUser, assignHospitalUserRoles } from '@/api/medical/hospitalUser'
import { listHospitalRole } from '@/api/medical/hospitalRole'
import { listHospitalDept } from '@/api/medical/hospitalDept'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalHospitalUser',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      userList: [],
      roleOptions: [],
      deptOptions: [],
      open: false,
      roleOpen: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, uid: undefined, status: undefined },
      form: {},
      roleForm: { hospitalUserId: undefined, roleIds: [] },
      rules: {
        nickName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '登录密码不能为空', trigger: 'blur' }],
        roleIds: [{ required: true, type: 'array', message: '用户角色不能为空', trigger: 'change' }],
        deptId: [{ required: true, message: '用户部门不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    listHospitalRole({ pageNum: 1, pageSize: 100 }).then(response => { this.roleOptions = response.rows || [] })
    listHospitalDept().then(response => { this.deptOptions = response.data || response.rows || [] })
  },
  methods: {
    getList() {
      this.loading = true
      listHospitalUser(this.queryParams).then(response => {
        this.userList = response.rows
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
    reset() {
      this.form = { nickName: undefined, phonenumber: undefined, email: undefined, password: undefined, roleIds: [], deptId: undefined }
    },
    handleAdd() {
      this.reset()
      this.title = '新增医院用户'
      this.open = true
    },
    handleUpdate(row) {
      getHospitalUser(row.hospitalUserId).then(response => {
        this.form = response.data
        this.title = '修改医院用户'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        if (!this.form.hospitalUserId && !this.form.phonenumber && !this.form.email) {
          this.$modal.msgError('手机号和邮箱至少填写一个')
          return
        }
        const request = this.form.hospitalUserId ? updateHospitalUser(this.form) : addHospitalUser(this.form)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleRole(row) {
      getHospitalUser(row.hospitalUserId).then(response => {
        this.roleForm = { hospitalUserId: row.hospitalUserId, roleIds: response.data.roleIds || [] }
        this.roleOpen = true
      })
    },
    submitRoles() {
      assignHospitalUserRoles(this.roleForm.hospitalUserId, this.roleForm).then(() => {
        this.$modal.msgSuccess('授权成功')
        this.roleOpen = false
        this.getList()
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除用户"' + (row.nickName || row.userName || '') + '"？').then(() => {
        return delHospitalUser(row.hospitalUserId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    roleLevelName(roleLevel, isAdmin) {
      if (isAdmin === '1') {
        return '超级管理员'
      }
      const map = { 0: '超级管理员', 10: '合伙人', 20: '管理员', 30: '员工' }
      return map[roleLevel] || '成员'
    },
    isOwner(row) {
      return row.isAdmin === '1' || row.roleLevel === 0
    }
  }
}
</script>
