<template>
  <div class="register">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" autocomplete="off">
      <h3 class="title">{{ title }}</h3>
      <el-tabs v-model="registerType" stretch class="register-tabs">
        <el-tab-pane label="手机号注册" name="phone" />
        <el-tab-pane label="邮箱注册" name="email" />
      </el-tabs>
      <el-form-item v-if="registerType === 'phone'" prop="phonenumber">
        <el-input v-model="registerForm.phonenumber" name="register_phone" type="text" autocomplete="off" auto-complete="off" placeholder="手机号">
          <svg-icon slot="prefix" icon-class="phone" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item v-else prop="email">
        <el-input v-model="registerForm.email" name="register_email" type="text" autocomplete="off" auto-complete="off" placeholder="邮箱">
          <svg-icon slot="prefix" icon-class="email" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="inviteCode">
        <el-input v-model="registerForm.inviteCode" name="register_invite_code" type="text" autocomplete="off" auto-complete="off" placeholder="邀请码，可选">
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <template v-if="!registerForm.inviteCode">
        <el-form-item prop="hospitalName">
          <el-input v-model="registerForm.hospitalName" name="register_hospital_name" type="text" autocomplete="off" auto-complete="off" placeholder="医院/诊所名称">
            <svg-icon slot="prefix" icon-class="peoples" class="el-input__icon input-icon" />
          </el-input>
        </el-form-item>
        <el-form-item prop="hospitalType">
          <el-select v-model="registerForm.hospitalType" placeholder="医院类型，可选" clearable style="width: 100%;">
            <el-option label="医院" value="0" />
            <el-option label="口腔诊所" value="1" />
            <el-option label="其他" value="2" />
          </el-select>
        </el-form-item>
      </template>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          name="register_new_password"
          type="password"
          show-password
          autocomplete="new-password"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="captchaEnabled">
        <el-input
          v-model="registerForm.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleRegister"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" @click="getCode" class="register-code-img" />
        </div>
      </el-form-item>
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="medium" type="primary" style="width:100%;" @click.native.prevent="handleRegister">
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right;">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <div class="el-register-footer">
      <span>{{ footerContent }}</span>
    </div>
  </div>
</template>

<script>
import { getCodeImg, register } from '@/api/login'
import defaultSettings from '@/settings'

export default {
  name: 'Register',
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      footerContent: defaultSettings.footerContent,
      codeUrl: '',
      registerType: 'phone',
      registerForm: {
        username: '',
        phonenumber: '',
        email: '',
        hospitalName: '',
        hospitalType: '',
        inviteCode: '',
        password: '',
        code: '',
        uuid: ''
      },
      registerRules: {
        phonenumber: [
          { required: true, trigger: 'blur', message: '请输入手机号' },
          { min: 11, max: 11, message: '手机号长度必须为 11 位', trigger: 'blur' }
        ],
        email: [
          { required: true, trigger: 'blur', message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        hospitalName: [{ required: true, trigger: 'blur', message: '请输入医院/诊所名称' }],
        password: [
          { required: true, trigger: 'blur', message: '请输入您的密码' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
          { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\\\ |', trigger: 'blur' }
        ],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      loading: false,
      captchaEnabled: true
    }
  },
  watch: {
    registerType() {
      this.registerForm.username = ''
      this.registerForm.phonenumber = ''
      this.registerForm.email = ''
    }
  },
  created() {
    this.getCode()
    this.clearAutofillFields()
  },
  methods: {
    clearAutofillFields() {
      this.$nextTick(() => {
        this.registerForm.inviteCode = ''
        this.registerForm.password = ''
        window.setTimeout(() => {
          this.registerForm.inviteCode = ''
          this.registerForm.password = ''
        }, 200)
      })
    },
    getCode() {
      getCodeImg().then(res => {
        this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.registerForm.uuid = res.uuid
        }
      })
    },
    handleRegister() {
      this.registerForm.username = this.registerType === 'phone' ? this.registerForm.phonenumber : this.registerForm.email
      this.$refs.registerForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        const payload = Object.assign({}, this.registerForm)
        if (this.registerType === 'phone') {
          payload.email = ''
        } else {
          payload.phonenumber = ''
        }
        if (payload.inviteCode) {
          payload.hospitalName = ''
          payload.hospitalType = ''
        }
        register(payload).then(() => {
          this.$alert('<font color="red">操作成功，请使用账号登录。</font>', '系统提示', {
            dangerouslyUseHTMLString: true,
            type: 'success'
          }).then(() => {
            this.$router.push('/login')
          }).catch(() => {})
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
.register {
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
.register-tabs {
  margin-bottom: 16px;
}
.register-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;
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
.register-code {
  width: 33%;
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
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
.register-code-img {
  height: 38px;
}
</style>
