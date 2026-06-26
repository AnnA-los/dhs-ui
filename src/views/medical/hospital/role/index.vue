<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch">
      <el-form-item label="角色名称">
        <el-input v-model="queryParams.roleName" clearable @keyup.enter.native="handleQuery" />
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
    <el-table v-loading="loading" :data="roleList" :height="tableHeight" border fit>
      <el-table-column label="角色名称" prop="roleName" min-width="170" show-overflow-tooltip />
      <el-table-column label="层级" prop="roleLevel" min-width="110">
        <template slot-scope="scope">{{ roleLevelName(scope.row.roleLevel) }}</template>
      </el-table-column>
      <el-table-column label="默认" prop="isDefault" width="80">
        <template slot-scope="scope">{{ scope.row.isDefault === '1' ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="90">
        <template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" :disabled="scope.row.isDefault === '1'" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
    <el-dialog :title="title" :visible.sync="open" width="620px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="角色名称" prop="roleName"><el-input v-model="form.roleName" /></el-form-item>
        <el-form-item label="角色层级" prop="roleLevel">
          <el-select v-model="form.roleLevel" :disabled="!!form.roleId">
            <el-option label="合伙人" :value="10" />
            <el-option label="管理员" :value="20" />
            <el-option label="员工" :value="30" />
          </el-select>
        </el-form-item>
        <el-form-item label="页面按钮权限">
          <el-tree
            ref="menu"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            empty-text="暂无可分配权限"
            :props="{ label: 'label', children: 'children' }"
          />
        </el-form-item>
        <el-form-item label="状态">
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
import { listHospitalRole, getHospitalRole, addHospitalRole, updateHospitalRole, delHospitalRole } from '@/api/medical/hospitalRole'
import { treeselect } from '@/api/system/menu'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalHospitalRole',
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      showSearch: true,
      total: 0,
      roleList: [],
      menuOptions: [],
      open: false,
      title: '',
      queryParams: { pageNum: 1, pageSize: 10, roleName: undefined },
      form: {},
      rules: {
        roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
        roleLevel: [{ required: true, message: '角色层级不能为空', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
    this.getMenuTreeselect()
  },
  methods: {
    getList() {
      this.loading = true
      listHospitalRole(this.queryParams).then(response => {
        this.roleList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    reset() {
      this.form = { roleLevel: 30, status: '0', menuIds: [] }
      this.$nextTick(() => {
        if (this.$refs.menu) {
          this.$refs.menu.setCheckedKeys([])
        }
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
    handleAdd() {
      this.reset()
      this.title = '新增医院角色'
      this.open = true
    },
    handleUpdate(row) {
      getHospitalRole(row.roleId).then(response => {
        this.form = response.data
        this.title = '修改医院角色'
        this.open = true
        this.$nextTick(() => {
          if (this.$refs.menu) {
            this.$refs.menu.setCheckedKeys(this.form.menuIds || [])
          }
        })
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.form.menuIds = this.getCheckedMenuIds()
          const request = this.form.roleId ? updateHospitalRole(this.form) : addHospitalRole(this.form)
          request.then(() => {
            this.$modal.msgSuccess('保存成功')
            this.open = false
            this.getList()
          })
        }
      })
    },
    getMenuTreeselect() {
      treeselect({ status: '0' }).then(response => {
        this.menuOptions = this.filterInviteManagePermissions(response.data || [])
      })
    },
    filterInviteManagePermissions(nodes) {
      const hiddenLabels = ['邀请码查询', '邀请码新增', '邀请码修改', '邀请码删除', '个人邀请码查询', '个人邀请码生成']
      return nodes.reduce((list, node) => {
        if (hiddenLabels.includes(node.label)) {
          return list
        }
        const item = Object.assign({}, node)
        if (item.children && item.children.length) {
          item.children = this.filterInviteManagePermissions(item.children)
        }
        list.push(item)
        return list
      }, [])
    },
    getCheckedMenuIds() {
      const checkedKeys = this.$refs.menu ? this.$refs.menu.getCheckedKeys() : []
      const halfCheckedKeys = this.$refs.menu ? this.$refs.menu.getHalfCheckedKeys() : []
      return checkedKeys.concat(halfCheckedKeys)
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除角色"' + row.roleName + '"？').then(() => {
        return delHospitalRole(row.roleId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    roleLevelName(roleLevel) {
      const map = { 0: '超级管理员', 10: '合伙人', 20: '管理员', 30: '员工' }
      return map[roleLevel] || '成员'
    }
  }
}
</script>
