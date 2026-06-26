<template>
  <el-dialog :title="title" :visible.sync="innerOpen" width="520px" append-to-body @open="loadTypes">
    <div class="type-list">
      <el-tag v-for="item in typeList" :key="item.typeId" closable :disable-transitions="false" @close="markRemove(item)">{{ item.typeName }}</el-tag>
    </div>
    <div v-if="removeList.length" class="remove-tip">待删除 {{ removeList.length }} 项，保存后生效。已被使用的选项会被后端拒绝删除。</div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit">保 存</el-button>
      <el-button @click="innerOpen=false">取 消</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { medicalTypeOptions, delMedicalType } from '@/api/medical/type'
export default {
  name: 'TypeManageDialog',
  props: { value: Boolean, title: String, typeCategory: { type: String, required: true } },
  data() { return { typeList: [], removeList: [] } },
  computed: {
    innerOpen: { get() { return this.value }, set(v) { this.$emit('input', v) } }
  },
  methods: {
    loadTypes() {
      this.removeList = []
      medicalTypeOptions({ typeCategory: this.typeCategory }).then(r => { this.typeList = r.data || [] })
    },
    markRemove(item) {
      this.removeList.push(item)
      this.typeList = this.typeList.filter(type => type.typeId !== item.typeId)
    },
    submit() {
      Promise.all(this.removeList.map(item => delMedicalType(item.typeId))).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.innerOpen = false
        this.$emit('saved')
      })
    }
  }
}
</script>
<style scoped>
.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 80px;
}
.remove-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
