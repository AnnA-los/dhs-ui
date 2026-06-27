<template>
  <div class="app-container">
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <right-toolbar @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table
      v-loading="loading"
      :data="deptTree"
      :height="tableHeight"
      border
      fit
      row-key="deptId"
      default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column label="部门名称" prop="deptName" min-width="180" />
      <el-table-column label="上级部门" min-width="160">
        <template slot-scope="scope">{{ parentDeptName(scope.row.parentId) }}</template>
      </el-table-column>
      <el-table-column label="状态" prop="status" width="110">
        <template slot-scope="scope">{{ scope.row.status === '0' ? '正常' : '停用' }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="scope">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button type="text" size="mini" icon="el-icon-plus" @click="handleAddChild(scope.row)">新增子部门</el-button>
          <el-button type="text" size="mini" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
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
      deptTree: [],
      deptOptions: [],
      maxDeptLevel: 10,
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
        this.deptTree = this.buildDeptTree(this.deptList)
        this.deptOptions = this.buildDeptTree(this.deptList)
        this.loading = false
      })
    },
    reset(parentId) {
      const root = this.deptList.find(item => item.parentId === 0 || item.parentId === '0')
      this.deptOptions = this.buildDeptTree(this.deptList)
      this.form = {
        parentId: parentId !== undefined ? parentId : (root ? root.deptId : 0),
        deptType: '2',
        orderNum: 0,
        status: '0'
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
          this.$refs.form.clearValidate()
        }
      })
    },
    handleAdd() {
      this.reset()
      this.title = '新增医院部门'
      this.open = true
    },
    handleAddChild(row) {
      this.reset(row.deptId)
      this.title = '新增子部门'
      this.open = true
    },
    handleUpdate(row) {
      getHospitalDept(row.deptId).then(response => {
        this.deptOptions = this.buildDeptTree(this.deptList, row.deptId)
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
        if (!this.validateDeptParent()) {
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
    buildDeptTree(list, excludeDeptId) {
      const excludeIds = excludeDeptId ? this.getDescendantIds(excludeDeptId) : new Set()
      if (excludeDeptId) {
        excludeIds.add(String(excludeDeptId))
      }
      const map = {}
      const roots = []
      list.forEach(item => {
        if (!excludeIds.has(String(item.deptId))) {
          map[item.deptId] = Object.assign({}, item, { children: [] })
        }
      })
      Object.keys(map).forEach(key => {
        const item = map[key]
        if (item.parentId && map[item.parentId]) {
          map[item.parentId].children.push(item)
        } else {
          roots.push(item)
        }
      })
      this.assignDeptLevel(roots, 1)
      return roots
    },
    assignDeptLevel(nodes, level) {
      nodes.forEach(node => {
        node.level = level
        if (node.children && node.children.length) {
          this.assignDeptLevel(node.children, level + 1)
        }
      })
    },
    normalizer(node) {
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children && node.children.length ? node.children : undefined
      }
    },
    parentDeptName(parentId) {
      if (!parentId || String(parentId) === '0') {
        return '-'
      }
      const dept = this.deptList.find(item => String(item.deptId) === String(parentId))
      return dept ? dept.deptName : '-'
    },
    getDescendantIds(deptId, visited = new Set()) {
      const ids = new Set()
      const parentId = String(deptId)
      if (visited.has(parentId)) {
        return ids
      }
      visited.add(parentId)
      this.deptList.forEach(item => {
        if (String(item.parentId) === parentId) {
          const childId = String(item.deptId)
          ids.add(childId)
          if (!visited.has(childId)) {
            this.getDescendantIds(item.deptId, visited).forEach(id => ids.add(id))
          }
        }
      })
      return ids
    },
    getDeptLevel(deptId) {
      if (!deptId || String(deptId) === '0') {
        return 0
      }
      const map = {}
      this.deptList.forEach(item => {
        map[String(item.deptId)] = item
      })
      let level = 0
      let current = map[String(deptId)]
      const visited = new Set()
      while (current && !visited.has(String(current.deptId))) {
        visited.add(String(current.deptId))
        level += 1
        if (!current.parentId || String(current.parentId) === '0') {
          break
        }
        current = map[String(current.parentId)]
      }
      return level
    },
    getSubtreeDepth(deptId) {
      if (!deptId) {
        return 1
      }
      const children = this.deptList.filter(item => String(item.parentId) === String(deptId))
      if (!children.length) {
        return 1
      }
      return 1 + Math.max(...children.map(item => this.getSubtreeDepth(item.deptId)))
    },
    validateDeptParent() {
      if (this.form.deptId && String(this.form.parentId) === String(this.form.deptId)) {
        this.$modal.msgWarning('上级部门不能选择当前部门')
        return false
      }
      if (this.form.deptId && this.getDescendantIds(this.form.deptId).has(String(this.form.parentId))) {
        this.$modal.msgWarning('上级部门不能选择当前部门的下级部门')
        return false
      }
      const parentLevel = this.getDeptLevel(this.form.parentId)
      const branchDepth = this.form.deptId ? this.getSubtreeDepth(this.form.deptId) : 1
      if (parentLevel + branchDepth > this.maxDeptLevel) {
        this.$modal.msgWarning('医院部门最多支持' + this.maxDeptLevel + '层，请调整上级部门后再保存')
        return false
      }
      return true
    }
  }
}
</script>
