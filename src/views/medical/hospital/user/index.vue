<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="用户" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="姓名/手机号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-select v-model="queryParams.deptId" filterable placeholder="请选择部门" clearable>
          <el-option v-for="dept in deptOptions" :key="dept.deptId" :label="dept.deptOptionName" :value="dept.deptId" />
        </el-select>
      </el-form-item>
      <el-form-item label="岗位" prop="postId">
        <el-select v-model="queryParams.postId" filterable remote clearable placeholder="请选择岗位" :remote-method="remotePosts" :loading="postLoading">
          <el-option v-for="post in postOptions" :key="post.postId" :label="post.postName" :value="post.postId" />
        </el-select>
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
      <el-table-column label="手机号" prop="phonenumber" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.phonenumber || '-' }}</template>
      </el-table-column>
      <el-table-column label="部门" prop="deptName" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
      </el-table-column>
      <el-table-column label="岗位" prop="postName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.postName || '-' }}</template>
      </el-table-column>
      <el-table-column label="角色" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ formatRoleNames(scope.row) }}</template>
      </el-table-column>
      <el-table-column label="邀请人" prop="inviterUserName" min-width="120" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.inviterUserName || '-' }}</template>
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
          <el-button type="text" size="mini" icon="el-icon-delete" :disabled="isOwner(scope.row)" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名称" prop="nickName"><el-input v-model="form.nickName" /></el-form-item>
        <el-form-item label="手机号码" prop="phonenumber"><el-input v-model="form.phonenumber" /></el-form-item>
        <template v-if="!form.hospitalUserId">
          <el-form-item label="登录密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        </template>
        <el-form-item label="用户角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roleOptions" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户部门" prop="deptId">
          <el-select v-model="form.deptId" filterable placeholder="请选择部门" clearable style="width: 100%">
            <el-option v-for="dept in deptOptions" :key="dept.deptId" :label="dept.deptOptionName" :value="dept.deptId" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户岗位" prop="postId">
          <el-select v-model="form.postId" filterable remote clearable placeholder="请选择岗位" :remote-method="remotePosts" :loading="postLoading" style="width: 100%">
            <el-option v-for="post in postOptions" :key="post.postId" :label="post.postName" :value="post.postId" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listHospitalUser, getHospitalUser, addHospitalUser, updateHospitalUser, delHospitalUser } from '@/api/medical/hospitalUser'
import { listHospitalRole } from '@/api/medical/hospitalRole'
import { listHospitalDept } from '@/api/medical/hospitalDept'
import { hospitalPostOptions } from '@/api/medical/hospitalPost'
import { flattenHospitalDeptOptions } from '@/utils/medicalDept'
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
      postOptions: [],
      postLoading: false,
      open: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, nickName: undefined, deptId: undefined, postId: undefined, status: undefined },
      form: {},
      rules: {
        nickName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
        phonenumber: [{ required: true, message: '手机号码不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '登录密码不能为空', trigger: 'blur' }],
        roleIds: [{ required: true, type: 'array', message: '用户角色不能为空', trigger: 'change' }],
        deptId: [{ required: true, message: '用户部门不能为空', trigger: 'change' }],
        postId: [{ required: true, message: '用户岗位不能为空', trigger: 'change' }],
        status: [{ required: true, message: '用户状态不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    listHospitalRole({ pageNum: 1, pageSize: 100 }).then(response => { this.roleOptions = response.rows || [] })
    listHospitalDept().then(response => { this.deptOptions = flattenHospitalDeptOptions(response.data || response.rows || []) })
    this.remotePosts('')
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
      this.form = { nickName: undefined, phonenumber: undefined, password: undefined, roleIds: [], deptId: undefined, postId: undefined, status: '0' }
    },
    remotePosts(query) {
      this.postLoading = true
      hospitalPostOptions({ postName: query }).then(response => {
        this.postOptions = response.data || []
        this.postLoading = false
      })
    },
    handleAdd() {
      this.reset()
      this.title = '新增医院用户'
      this.open = true
    },
    handleUpdate(row) {
      getHospitalUser(row.hospitalUserId).then(response => {
        this.form = Object.assign({ roleIds: [], status: '0' }, response.data)
        this.title = '修改医院用户'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const data = Object.assign({}, this.form)
        delete data.email
        const request = data.hospitalUserId ? updateHospitalUser(data) : addHospitalUser(data)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
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
    formatRoleNames(row) {
      if (Array.isArray(row.roleNames)) {
        return row.roleNames.join('、') || '-'
      }
      if (row.roleNames) {
        return row.roleNames
      }
      if (row.roleName) {
        return row.roleName
      }
      if (Array.isArray(row.roles)) {
        return row.roles.map(role => role.roleName).filter(Boolean).join('、') || '-'
      }
      if (Array.isArray(row.roleIds)) {
        const roleNames = row.roleIds.map(roleId => {
          const role = this.roleOptions.find(item => String(item.roleId) === String(roleId))
          return role && role.roleName
        }).filter(Boolean)
        return roleNames.join('、') || '-'
      }
      return '-'
    },
    isOwner(row) {
      return row.isAdmin === '1' || row.roleLevel === 0
    }
  }
}
</script>
