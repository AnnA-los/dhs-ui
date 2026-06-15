<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="deptList" :height="tableHeight" border fit row-key="deptId">
      <el-table-column label="部门名称" prop="deptName" min-width="180" />
      <el-table-column label="上级部门" min-width="160">
        <template slot-scope="scope">{{ parentDeptName(scope.row.parentId) }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="110">
        <template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="title" :visible.sync="open" width="560px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="上级部门" prop="parentId">
          <treeselect
            v-model="form.parentId"
            :options="deptOptions"
            :normalizer="normalizer"
            :show-count="true"
            placeholder="请选择上级部门"
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
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
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { listHospitalDept, getHospitalDept, addHospitalDept, updateHospitalDept, delHospitalDept } from '@/api/medical/hospitalDept'
import medicalTableHeight from '@/views/medical/mixins/tableHeight'

export default {
  name: 'MedicalHospitalDept',
  components: { Treeselect },
  mixins: [medicalTableHeight],
  data() {
    return {
      loading: true,
      deptList: [],
      deptOptions: [],
      open: false,
      title: '',
      form: {},
      rules: {
        parentId: [{ required: true, message: '上级部门不能为空', trigger: 'change' }],
        deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listHospitalDept().then(response => {
        this.deptList = response.data || response.rows || []
        this.deptOptions = this.buildDeptTree(this.deptList)
        this.loading = false
      })
    },
    reset() {
      const root = this.deptList.find(item => item.parentId === 0 || item.parentId === '0')
      this.form = { parentId: root ? root.deptId : 0, deptType: '2', orderNum: 0, status: '0' }
    },
    handleAdd() {
      this.reset()
      this.title = '新增医院部门'
      this.open = true
    },
    handleUpdate(row) {
      getHospitalDept(row.deptId).then(response => {
        this.form = Object.assign({ deptType: '2', orderNum: 0, status: '0' }, response.data)
        this.title = '修改医院部门'
        this.open = true
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        const data = Object.assign({}, this.form, { deptType: this.form.deptType || '2', orderNum: this.form.orderNum || 0 })
        const request = data.deptId ? updateHospitalDept(data) : addHospitalDept(data)
        request.then(() => {
          this.$modal.msgSuccess('保存成功')
          this.open = false
          this.getList()
        })
      })
    },
    handleDelete(row) {
      this.$modal.confirm('是否确认删除部门"' + row.deptName + '"？').then(() => {
        return delHospitalDept(row.deptId)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    },
    buildDeptTree(list) {
      const map = {}
      const roots = []
      list.forEach(item => {
        map[item.deptId] = Object.assign({}, item, { children: [] })
      })
      Object.keys(map).forEach(key => {
        const item = map[key]
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children.push(item)
        } else {
          roots.push(item)
        }
      })
      return roots
    },
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    parentDeptName(parentId) {
      if (!parentId || String(parentId) === '0') {
        return '-'
      }
      const dept = this.deptList.find(item => String(item.deptId) === String(parentId))
      return dept ? dept.deptName : '-'
    }
  }
}
</script>
