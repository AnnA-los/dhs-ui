<template>
  <div class="login">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="off">
      <div class="login-brand">
        <img :src="logo" alt="DHS logo" class="login-brand-logo" />
        <h3 class="title">{{ title }}</h3>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          name="login_phone"
          type="text"
          autocomplete="off"
          auto-complete="off"
          placeholder="请输入手机号"
        >
          <svg-icon slot="prefix" icon-class="phone" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          name="login_password"
          type="password"
          show-password
          autocomplete="current-password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="smsCode">
        <div class="sms-code-row">
          <el-input
            v-model="loginForm.smsCode"
            auto-complete="off"
            placeholder="手机验证码"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </el-input>
          <el-button class="sms-code-btn" :disabled="smsCountdown > 0" @click="handleSendSmsCode">
            {{ smsCountdown > 0 ? smsCountdown + 's' : '发送验证码' }}
          </el-button>
        </div>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="loginForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="medium" type="primary" style="width:100%;" @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>

    <el-dialog
      title="选择医院"
      :visible.sync="hospitalDialogOpen"
      width="380px"
      custom-class="login-hospital-dialog"
      :close-on-click-modal="false"
      append-to-body
      @close="cancelSelectHospital"
    >
      <div class="hospital-select-list">
        <div
          v-for="item in loginHospitals"
          :key="item.hospitalUserId"
          class="hospital-select-item"
        >
          <div class="hospital-select-content">
            <div class="hospital-select-name">{{ item.hospitalName }}</div>
            <div class="hospital-select-meta">{{ roleLevelName(item.roleLevel, item.isAdmin) }} · {{ item.deptName || '医院主体' }}</div>
          </div>
          <el-button type="primary" class="hospital-enter-btn" @click="confirmSelectHospital(item)">进入</el-button>
        </div>
      </div>
    </el-dialog>

    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg, sendSmsCode } from '@/api/login'
import { listLoginHospitals, selectLoginHospital } from '@/api/medical/hospital'
import { setToken, removeToken } from '@/utils/auth'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'
import logoImg from '@/assets/logo/logo.svg'

export default {
  name: 'Login',
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      logo: logoImg,
      footerContent: defaultSettings.footerContent,
      codeUrl: '',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        smsCode: '',
        code: '',
        uuid: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入手机号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
        smsCode: [{ validator: (rule, value, callback) => this.validateSmsCode(value, callback), trigger: 'blur' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      loading: false,
      captchaEnabled: true,
      smsRealSendEnabled: true,
      register: true,
      smsCountdown: 0,
      smsTimer: null,
      redirect: undefined,
      hospitalDialogOpen: false,
      loginHospitals: [],
      selectedHospital: null
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  beforeDestroy() {
    if (this.smsTimer) {
      window.clearInterval(this.smsTimer)
    }
  },
  methods: {
    handleSendSmsCode() {
      if (!/^1[3-9]\d{9}$/.test(this.loginForm.username || '')) {
        this.$modal.msgError('请先输入正确的手机号')
        return
      }
      sendSmsCode(this.loginForm.username).then(() => {
        this.$modal.msgSuccess(this.smsRealSendEnabled ? '验证码已发送' : '短信真实发送已关闭，已跳过发送')
        this.startSmsCountdown()
      })
    },
    validateSmsCode(value, callback) {
      if (this.smsRealSendEnabled && !value) {
        callback(new Error('请输入手机验证码'))
        return
      }
      callback()
    },
    startSmsCountdown() {
      this.smsCountdown = 60
      if (this.smsTimer) {
        window.clearInterval(this.smsTimer)
      }
      this.smsTimer = window.setInterval(() => {
        this.smsCountdown -= 1
        if (this.smsCountdown <= 0) {
          window.clearInterval(this.smsTimer)
          this.smsTimer = null
        }
      }, 1000)
    },
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        this.smsRealSendEnabled = res.smsRealSendEnabled === undefined ? true : res.smsRealSendEnabled
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.loginForm.uuid = res.uuid
        } else {
          this.codeUrl = ''
          this.loginForm.code = ''
          this.loginForm.uuid = ''
        }
      })
    },
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      const isEmailAccount = username && username.indexOf('@') > -1
      if (isEmailAccount) {
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }
      this.loginForm.username = isEmailAccount ? '' : (username || '')
      this.loginForm.password = isEmailAccount || password === undefined ? '' : decrypt(password)
      this.loginForm.rememberMe = isEmailAccount || rememberMe === undefined ? false : Boolean(rememberMe)
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        if (this.loginForm.rememberMe) {
          Cookies.set('username', this.loginForm.username, { expires: 30 })
          Cookies.set('password', encrypt(this.loginForm.password), { expires: 30 })
          Cookies.set('rememberMe', this.loginForm.rememberMe, { expires: 30 })
        } else {
          Cookies.remove('username')
          Cookies.remove('password')
          Cookies.remove('rememberMe')
        }
        this.$store.dispatch('Login', this.loginForm).then(res => {
          if (res.needSelectHospital) {
            this.loadLoginHospitals()
            return
          }
          this.goHome()
        }).catch(() => {
          this.loading = false
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      })
    },
    loadLoginHospitals() {
      listLoginHospitals().then(response => {
        this.loginHospitals = response.data || []
        this.selectedHospital = this.loginHospitals.find(item => item.isCurrent === '1') || this.loginHospitals[0] || null
        this.hospitalDialogOpen = true
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    confirmSelectHospital(hospital) {
      const targetHospital = hospital || this.selectedHospital
      if (!targetHospital) {
        return
      }
      selectLoginHospital(targetHospital.hospitalUserId).then(response => {
        setToken(response.token)
        this.$store.commit('SET_TOKEN', response.token)
        this.goHome()
      })
    },
    cancelSelectHospital() {
      this.hospitalDialogOpen = false
      this.loading = false
      removeToken()
      this.$store.commit('SET_TOKEN', '')
    },
    goHome() {
      this.$router.push({ path: this.redirect || '/' }).catch(() => {})
    },
    roleLevelName(roleLevel, isAdmin) {
      if (isAdmin === '1') {
        return '超级管理员'
      }
      const map = { 0: '超级管理员', 10: '合伙人', 20: '管理员', 30: '员工' }
      return map[roleLevel] || '成员'
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f8eef7;
}
.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 18px auto;
}
.login-brand-logo {
  width: 70px;
  height: 70px;
  flex: 0 0 70px;
}
.title {
  margin: 0;
  text-align: center;
  color: #25324b;
  font-weight: 600;
}
.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
  z-index: 1;
  .el-input {
    height: 38px;
    input {
      height: 38px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}
.login-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #8a6f86;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}

.sms-code-row {
  display: grid;
  grid-template-columns: 1fr 112px;
  gap: 10px;
}

.sms-code-btn {
  height: 38px;
  padding: 0 10px;
}

::v-deep .login-hospital-dialog {
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  margin: 0 !important;
  transform: translate(-50%, -50%);

  .el-dialog__header {
    padding: 18px 22px 6px;
  }

  .el-dialog__title {
    color: #303133;
    font-size: 18px;
    font-weight: 500;
  }

  .el-dialog__headerbtn {
    top: 17px;
    right: 20px;
    font-size: 18px;
  }

  .el-dialog__body {
    padding: 20px 22px 24px;
  }
}

.hospital-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hospital-select-item {
  min-height: 56px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;

}

.hospital-select-content {
  min-width: 0;
}

.hospital-select-name {
  color: #303133;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
}

.hospital-select-meta {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
  line-height: 1.2;
}

.hospital-enter-btn {
  width: 56px;
  height: 30px;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
}
</style>
