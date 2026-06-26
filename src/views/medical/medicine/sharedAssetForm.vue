<template>
  <el-form ref="form" :model="form" label-width="100px">
    <el-form-item :label="nameLabel">
      <el-input v-model="form[nameProp]" />
    </el-form-item>
    <el-form-item label="类型">
      <el-autocomplete
        v-model="form[typeProp]"
        clearable
        placeholder="请选择或输入类型"
        :fetch-suggestions="queryTypeSuggestions"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item v-if="typeCategory === 'MEDICINE'" label="过期时间">
      <el-date-picker v-model="form.expireTime" value-format="yyyy-MM-dd" type="date" />
    </el-form-item>
    <el-form-item label="采购时间">
      <el-date-picker v-model="form.purchaseTime" value-format="yyyy-MM-dd" type="date" />
    </el-form-item>
    <el-form-item v-if="form.purchaseBatchNo" label="采购批次号">
      <el-input v-model="form.purchaseBatchNo" disabled />
    </el-form-item>
    <el-form-item label="采购数量">
      <el-input-number v-model="form.purchaseQuantity" :precision="0" :step="1" step-strictly :min="0" />
    </el-form-item>
    <el-form-item v-if="canEditRemaining && form[primaryKeyProp]" label="剩余数量">
      <el-input-number v-model="form.remainingQuantity" :precision="0" :step="1" step-strictly :min="0" />
    </el-form-item>
    <el-form-item label="单价">
      <el-input-number v-model="form.unitPrice" :precision="2" :min="0" />
    </el-form-item>
    <el-form-item v-if="typeCategory === 'MEDICINE'" label="售价">
      <el-input-number v-model="form.salePrice" :precision="2" :min="0" />
    </el-form-item>
    <el-form-item label="告警阈值">
      <el-input-number v-model="form.warningThreshold" :precision="0" :step="1" step-strictly :min="0" />
    </el-form-item>
    <el-form-item label="备注">
      <el-input v-model="form.remark" type="textarea" />
    </el-form-item>
  </el-form>
</template>

<script>
import { medicalTypeOptions } from '@/api/medical/type'

export default {
  props: {
    form: { type: Object, required: true },
    typeCategory: { type: String, required: true },
    nameLabel: { type: String, required: true },
    nameProp: { type: String, required: true },
    typeProp: { type: String, required: true },
    primaryKeyProp: { type: String, default: 'medicineId' },
    canEditRemaining: { type: Boolean, default: false }
  },
  data() {
    return { typeOptions: [] }
  },
  created() {
    medicalTypeOptions({ typeCategory: this.typeCategory }).then(response => {
      this.typeOptions = response.data || []
    })
  },
  methods: {
    queryTypeSuggestions(queryString, cb) {
      const keyword = (queryString || '').toLowerCase()
      cb(this.typeOptions
        .filter(item => !keyword || item.typeName.toLowerCase().includes(keyword))
        .map(item => ({ value: item.typeName })))
    }
  }
}
</script>
