<template>
  <div class="admin-login">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="admin-login-form" autocomplete="off">
      <div class="brand">
        <div class="brand-mark">DHS</div>
        <div>
          <h3 class="title">系统超管登录</h3>
          <p class="subtitle">仅限平台系统维护账号使用</p>
        </div>
      </div>
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          name="admin_username"
          type="text"
          autocomplete="off"
          auto-complete="off"
          placeholder="请输入系统账号"
        >
          <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          name="admin_password"
          type="password"
          show-password
          autocomplete="current-password"
          auto-complete="off"
          placeholder="请输入密码"
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
          class="code-input"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="login-code">
          <img :src="codeUrl" @click="getCode" class="login-code-img" />
        </div>
      </el-form-item>
      <el-form-item class="action-row">
        <el-button :loading="loading" size="medium" type="primary" class="login-btn" @click.native.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
      <div class="login-links">
        <router-link class="link-type" :to="'/login'">医院用户登录</router-link>
      </div>
    </el-form>
    <div class="el-login-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg } from '@/api/login'
import defaultSettings from '@/settings'

export default {
  name: 'AdminLogin',
  data() {
    return {
      footerContent: defaultSettings.footerContent,
      codeUrl: '',
      loginForm: {
        username: '',
        password: '',
        code: '',
        uuid: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '请输入系统账号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入您的密码' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      loading: false,
      captchaEnabled: true,
      redirect: undefined
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
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        this.$store.dispatch('AdminLogin', this.loginForm).then(() => {
          this.$router.push({ path: this.redirect || '/' }).catch(() => {})
        }).catch(() => {
          this.loading = false
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.admin-login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #f8eef7;
}

.admin-login::before {
  content: "";
  position: fixed;
  inset: 0;
  background: transparent;
}

.admin-login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 420px;
  padding: 28px 28px 16px 28px;
  z-index: 1;
  box-shadow: 0 12px 32px rgba(16, 24, 40, 0.18);

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

.brand {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.brand-mark {
  width: 48px;
  height: 48px;
  margin-right: 14px;
  border-radius: 6px;
  background: #1f5eff;
  color: #ffffff;
  font-weight: 700;
  line-height: 48px;
  text-align: center;
  letter-spacing: 0;
}

.title {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.subtitle {
  margin: 6px 0 0;
  color: #909399;
  font-size: 13px;
}

.code-input {
  width: 63%;
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

.login-code-img {
  height: 38px;
}

.action-row {
  margin-bottom: 12px;
}

.login-btn {
  width: 100%;
}

.login-links {
  text-align: right;
  line-height: 22px;
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
</style>
