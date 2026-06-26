export default {
  data() {
    return {
      tableHeight: 520
    }
  },
  mounted() {
    this.calcMedicalTableHeight()
    window.addEventListener('resize', this.calcMedicalTableHeight)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.calcMedicalTableHeight)
  },
  methods: {
    calcMedicalTableHeight() {
      // 医疗列表固定表格高度，避免少量数据时表格塌陷，超出时由表格内部滚动。
      this.tableHeight = Math.max(420, window.innerHeight - 330)
    }
  }
}
