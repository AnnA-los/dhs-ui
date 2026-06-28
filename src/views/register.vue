<template>
  <div class="register">
    <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" autocomplete="off">
      <h3 class="title">{{ title }}</h3>
      <el-form-item prop="phonenumber">
        <el-input v-model="registerForm.phonenumber" name="register_phone" type="text" autocomplete="off" auto-complete="off" placeholder="手机号">
          <svg-icon slot="prefix" icon-class="phone" class="el-input__icon input-icon" />
        </el-input>
      </el-form-item>
      <el-form-item prop="smsCode">
        <div class="sms-code-row">
          <el-input v-model="registerForm.smsCode" auto-complete="off" placeholder="手机验证码">
            <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
          </el-input>
          <el-button class="sms-code-btn" :disabled="smsCountdown > 0" @click="handleSendSmsCode">
            {{ smsCountdown > 0 ? smsCountdown + 's' : '发送验证码' }}
          </el-button>
        </div>
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
import { getCodeImg, register, sendSmsCode } from '@/api/login'
import defaultSettings from '@/settings'

export default {
  name: 'Register',
  data() {
    return {
      title: process.env.VUE_APP_TITLE,
      footerContent: defaultSettings.footerContent,
      codeUrl: '',
      registerForm: {
        username: '',
        phonenumber: '',
        hospitalName: '',
        hospitalType: '',
        inviteCode: '',
        password: '',
        smsCode: '',
        code: '',
        uuid: ''
      },
      registerRules: {
        phonenumber: [
          { required: true, trigger: 'blur', message: '请输入手机号' },
          { min: 11, max: 11, message: '手机号长度必须为 11 位', trigger: 'blur' }
        ],
        hospitalName: [{ required: true, trigger: 'blur', message: '请输入医院/诊所名称' }],
        password: [
          { required: true, trigger: 'blur', message: '请输入您的密码' },
          { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' },
          { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\\\ |', trigger: 'blur' }
        ],
        smsCode: [{ validator: (rule, value, callback) => this.validateSmsCode(value, callback), trigger: 'blur' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      },
      loading: false,
      captchaEnabled: true,
      smsRealSendEnabled: true,
      smsCountdown: 0,
      smsTimer: null
    }
  },
  created() {
    this.getCode()
    this.clearAutofillFields()
  },
  beforeDestroy() {
    if (this.smsTimer) {
      window.clearInterval(this.smsTimer)
    }
  },
  methods: {
    handleSendSmsCode() {
      if (!/^1[3-9]\d{9}$/.test(this.registerForm.phonenumber || '')) {
        this.$modal.msgError('请先输入正确的手机号')
        return
      }
      sendSmsCode(this.registerForm.phonenumber).then(() => {
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
        this.smsRealSendEnabled = res.smsRealSendEnabled === undefined ? true : res.smsRealSendEnabled
        if (this.captchaEnabled) {
          this.codeUrl = 'data:image/gif;base64,' + res.img
          this.registerForm.uuid = res.uuid
        } else {
          this.codeUrl = ''
          this.registerForm.code = ''
          this.registerForm.uuid = ''
        }
      })
    },
    handleRegister() {
      this.registerForm.username = this.registerForm.phonenumber
      this.$refs.registerForm.validate(valid => {
        if (!valid) {
          return
        }
        this.loading = true
        const payload = Object.assign({}, this.registerForm)
        delete payload.email
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
  background: #f8eef7;
}
.title {
  margin: 0 auto 18px auto;
  text-align: center;
  color: #707070;
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
  color: #8a6f86;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
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
</style>
