<template>
  <div class="login">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="off">
      <h3 class="title">{{ title }}</h3>
      <el-tabs v-model="loginType" stretch class="login-tabs">
        <el-tab-pane label="手机号登录" name="phone" />
        <el-tab-pane label="邮箱登录" name="email" />
      </el-tabs>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          :name="loginType === 'phone' ? 'login_phone' : 'login_email'"
          type="text"
          autocomplete="off"
          auto-complete="off"
          :placeholder="loginType === 'phone' ? '请输入手机号' : '请输入邮箱'"
        >
          <svg-icon slot="prefix" :icon-class="loginType === 'phone' ? 'phone' : 'email'" class="el-input__icon input-icon" />
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

    <el-dialog title="选择医院" :visible.sync="hospitalDialogOpen" width="520px" :close-on-click-modal="false" :show-close="false" append-to-body>
      <div class="hospital-dialog-tip">您的登录账号在系统中存在多个医院，请选择本次进入的医院</div>
      <el-table :data="loginHospitals" border fit highlight-current-row @row-click="selectedHospital = $event">
        <el-table-column label="医院" prop="hospitalName" min-width="180" show-overflow-tooltip />
        <el-table-column label="角色" min-width="120">
          <template slot-scope="scope">{{ roleLevelName(scope.row.roleLevel, scope.row.isAdmin) }}</template>
        </el-table-column>
        <el-table-column label="部门" prop="deptName" min-width="120">
          <template slot-scope="scope">{{ scope.row.deptName || '-' }}</template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSelectHospital">取消</el-button>
        <el-button type="primary" :disabled="!selectedHospital" @click="confirmSelectHospital">确定</el-button>
      </div>
    </el-dialog>

    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from '@/api/login'
import { listLoginHospitals, selectLoginHospital } from '@/api/medical/hospital'
import { setToken, removeToken } from '@/utils/auth'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'

export default {
  name: 'Login',
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      footerContent: defaultSettings.footerContent,
      codeUrl: '',
      loginType: 'phone',
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        code: '',
        uuid: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入登录账号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      loading: false,
      captchaEnabled: true,
      register: true,
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
    },
    loginType() {
      this.loginForm.username = ''
    }
  },
  created() {
    this.getCode()
    this.getCookie()
  },
  methods: {
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.loginForm.uuid = res.uuid
        }
      })
    },
    getCookie() {
      const username = Cookies.get('username')
      const password = Cookies.get('password')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm.username = username || ''
      this.loginForm.password = password === undefined ? '' : decrypt(password)
      this.loginForm.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
      if (this.loginForm.username && this.loginForm.username.indexOf('@') > -1) {
        this.loginType = 'email'
      }
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
    confirmSelectHospital() {
      if (!this.selectedHospital) {
        return
      }
      selectLoginHospital(this.selectedHospital.hospitalUserId).then(response => {
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
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.title {
  margin: 0 auto 18px auto;
  text-align: center;
  color: #707070;
}
.login-tabs {
  margin-bottom: 16px;
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
.hospital-dialog-tip {
  margin-bottom: 14px;
  color: #606266;
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 38px;
}
</style>
