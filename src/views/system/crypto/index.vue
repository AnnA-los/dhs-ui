<template>
  <div class="app-container crypto-page">
    <el-card shadow="never" class="tool-card">
      <div slot="header" class="card-title">加解密工具</div>
      <el-alert
        :title="'业务落库加密开关：' + (enabled ? '已开启' : '未开启') + '（工具仍可加解密）'"
        type="info"
        :closable="false"
        show-icon
      />
      <el-tabs v-model="activeTab" class="crypto-tabs">
        <el-tab-pane label="数据库字段" name="database">
          <el-form label-width="80px" class="tool-form">
            <el-form-item label="输入">
              <el-input
                v-model="databaseForm.input"
                type="textarea"
                :rows="5"
                placeholder="请输入数据库字段明文或 ENC: 密文"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleDatabaseEncrypt">加密</el-button>
              <el-button @click="handleDatabaseDecrypt">解密</el-button>
            </el-form-item>
            <el-form-item label="输出">
              <el-input
                v-model="databaseForm.output"
                type="textarea"
                :rows="5"
                placeholder="数据库字段输出，格式为 ENC:..."
                readonly
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="接口出入参" name="api">
          <el-form label-width="80px" class="tool-form">
            <el-form-item label="输入">
              <el-input
                v-model="apiForm.input"
                type="textarea"
                :rows="5"
                placeholder="请输入接口参数明文或 API: 密文"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleApiEncrypt">加密</el-button>
              <el-button @click="handleApiDecrypt">解密</el-button>
            </el-form-item>
            <el-form-item label="输出">
              <el-input
                v-model="apiForm.output"
                type="textarea"
                :rows="5"
                placeholder="接口参数输出，格式为 API:..."
                readonly
              />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { cryptoStatus, encryptValue, decryptValue, encryptApiValue, decryptApiValue } from '@/api/system/crypto'

export default {
  name: 'SystemCryptoTool',
  data() {
    return {
      enabled: false,
      activeTab: 'database',
      databaseForm: { input: '', output: '' },
      apiForm: { input: '', output: '' }
    }
  },
  created() {
    cryptoStatus().then(r => { this.enabled = !!r.data })
  },
  methods: {
    handleDatabaseEncrypt() {
      encryptValue(this.databaseForm.input).then(r => { this.databaseForm.output = (r.data || {}).value || '' })
    },
    handleDatabaseDecrypt() {
      decryptValue(this.databaseForm.input).then(r => { this.databaseForm.output = (r.data || {}).value || '' })
    },
    handleApiEncrypt() {
      encryptApiValue(this.apiForm.input).then(r => { this.apiForm.output = (r.data || {}).value || '' })
    },
    handleApiDecrypt() {
      decryptApiValue(this.apiForm.input).then(r => { this.apiForm.output = (r.data || {}).value || '' })
    }
  }
}
</script>

<style scoped>
.crypto-page {
  background: #f5f7fa;
}
.tool-card {
  max-width: 920px;
}
.card-title {
  font-weight: 600;
}
.crypto-tabs {
  margin-top: 18px;
}
.tool-form {
  margin-top: 18px;
}
</style>
