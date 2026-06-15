<template>
  <div class="app-container profile-page">
    <el-card shadow="never" class="profile-hero">
      <div class="profile-header">
        <userAvatar />
        <div class="profile-title">
          <div class="profile-name">{{ user.nickName || user.userName || '-' }}</div>
          <div class="profile-subtitle">{{ currentHospital.hospitalName || '未选择医院' }} · {{ currentRoleName }}</div>
        </div>
      </div>
    </el-card>

    <section class="profile-block">
      <h3 class="block-title">基础信息</h3>
      <div class="base-panel">
        <div class="info-cell">
          <span class="info-label">医院名称</span>
          <div class="info-content">
            <template v-if="editingField === 'hospitalName'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveHospitalField('hospitalName', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ currentHospital.hospitalName || '-' }}</strong>
              <el-button v-if="canEditHospital" type="text" icon="el-icon-edit" @click="startEdit('hospitalName', currentHospital.hospitalName)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">医院类型</span>
          <div class="info-content">
            <template v-if="editingField === 'hospitalType'">
              <el-select v-model="editValue" size="mini" class="inline-input">
                <el-option v-for="item in hospitalTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-button type="text" icon="el-icon-check" @click="saveHospitalField('hospitalType', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ hospitalTypeName(currentHospital.hospitalType) }}</strong>
              <el-button v-if="canEditHospital" type="text" icon="el-icon-edit" @click="startEdit('hospitalType', String(currentHospital.hospitalType || ''))" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">联系地址</span>
          <div class="info-content">
            <template v-if="editingField === 'address'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveHospitalField('address', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ currentHospital.address || '-' }}</strong>
              <el-button v-if="canEditHospital" type="text" icon="el-icon-edit" @click="startEdit('address', currentHospital.address)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">联系电话</span>
          <div class="info-content">
            <template v-if="editingField === 'contactPhone'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveHospitalField('contactPhone', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ currentHospital.contactPhone || '-' }}</strong>
              <el-button v-if="canEditHospital" type="text" icon="el-icon-edit" @click="startEdit('contactPhone', currentHospital.contactPhone)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">用户ID</span>
          <div class="info-content"><strong>{{ user.userId || '-' }}</strong></div>
        </div>
        <div class="info-cell">
          <span class="info-label">昵称</span>
          <div class="info-content">
            <template v-if="editingField === 'nickName'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveUserField('nickName', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ user.nickName || '-' }}</strong>
              <el-button type="text" icon="el-icon-edit" @click="startEdit('nickName', user.nickName)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">手机号码</span>
          <div class="info-content">
            <template v-if="editingField === 'phonenumber'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveUserField('phonenumber', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ user.phonenumber || '-' }}</strong>
              <el-button type="text" icon="el-icon-edit" @click="startEdit('phonenumber', user.phonenumber)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">邮箱</span>
          <div class="info-content">
            <template v-if="editingField === 'email'">
              <el-input v-model="editValue" size="mini" class="inline-input" />
              <el-button type="text" icon="el-icon-check" @click="saveUserField('email', editValue)">确认</el-button>
              <el-button type="text" icon="el-icon-close" @click="cancelEdit">取消</el-button>
            </template>
            <template v-else>
              <strong>{{ user.email || '-' }}</strong>
              <el-button type="text" icon="el-icon-edit" @click="startEdit('email', user.email)" />
            </template>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">登录密码</span>
          <div class="info-content">
            <strong>已设置</strong>
            <el-button type="text" @click="pwdOpen = true">修改密码</el-button>
          </div>
        </div>
        <div class="info-cell">
          <span class="info-label">所在部门</span>
          <div class="info-content"><strong>{{ currentHospitalUser.deptName || '-' }}</strong></div>
        </div>
        <div class="info-cell">
          <span class="info-label">注册时间</span>
          <div class="info-content"><strong>{{ user.createTime || '-' }}</strong></div>
        </div>
      </div>
    </section>

    <section v-if="canEditHospital" class="profile-block">
      <h3 class="block-title">账号安全</h3>
      <div class="security-panel">
        <div class="security-icon"><i class="el-icon-mobile-phone"></i></div>
        <div class="security-main">
          <div class="security-title">绑定手机：{{ user.phonenumber || '暂未绑定' }}</div>
          <div class="security-desc">仅医院超级管理员可见。更换手机号会把当前医院超级管理员权限转让给新手机号对应用户。</div>
        </div>
        <el-button type="text" @click="ownerPhoneOpen = true">更换手机号</el-button>
      </div>
    </section>

    <el-card v-if="canViewInvite" shadow="never" class="profile-section">
      <div slot="header" class="section-title">我的邀请码</div>
      <div class="invite-panel">
        <div>
          <div class="invite-code">{{ currentInvite.inviteCode || '-' }}</div>
          <div class="invite-desc">分享给其他用户注册，填写后加入当前医院</div>
        </div>
        <div class="invite-meta">
          <div>有效期至：{{ currentInvite.expireTime || '-' }}</div>
          <div>已使用：{{ currentInvite.usedCount || 0 }} 次</div>
        </div>
        <el-button type="primary" plain size="mini" :disabled="!currentInvite.inviteCode" @click="copyInviteCode">复制邀请码</el-button>
      </div>
    </el-card>

    <el-dialog title="修改密码" :visible.sync="pwdOpen" width="520px" append-to-body>
      <resetPwd />
    </el-dialog>

    <el-dialog title="更换超级管理员手机号" :visible.sync="ownerPhoneOpen" width="520px" append-to-body>
      <el-form ref="ownerPhoneForm" :model="ownerPhoneForm" :rules="ownerPhoneRules" label-width="110px">
        <el-form-item label="新手机号" prop="targetPhone">
          <el-input v-model="ownerPhoneForm.targetPhone" placeholder="请输入新手机号" />
        </el-form-item>
        <el-form-item label="当前密码" prop="confirmValue">
          <el-input v-model="ownerPhoneForm.confirmValue" type="password" show-password placeholder="请输入当前登录密码" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="ownerPhoneOpen = false">取消</el-button>
        <el-button type="primary" @click="submitOwnerPhone">确认换绑</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userAvatar from './userAvatar'
import resetPwd from './resetPwd'
import { mapGetters } from 'vuex'
import { getUserProfile, updateUserProfile } from '@/api/system/user'
import { getCurrentHospital, updateHospital, listMyHospitals, transferOwnerByPhone } from '@/api/medical/hospital'
import { getCurrentHospitalInvite } from '@/api/medical/hospitalInvite'

export default {
  name: 'Profile',
  components: { userAvatar, resetPwd },
  data() {
    return {
      user: {},
      currentHospital: {},
      currentInvite: {},
      inviteAccess: false,
      myHospitals: [],
      editingField: '',
      editValue: '',
      pwdOpen: false,
      ownerPhoneOpen: false,
      ownerPhoneForm: { targetPhone: '', confirmType: 'PASSWORD', confirmValue: '' },
      ownerPhoneRules: {
        targetPhone: [
          { required: true, message: '新手机号不能为空', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        confirmValue: [{ required: true, message: '当前密码不能为空', trigger: 'blur' }]
      },
      hospitalTypeOptions: [
        { label: '医院', value: '0' },
        { label: '口腔诊所', value: '1' },
        { label: '其他', value: '2' }
      ]
    }
  },
  computed: {
    ...mapGetters(['permissions']),
    currentHospitalUser() {
      return this.myHospitals.find(item => item.isCurrent === '1') || {}
    },
    currentRoleName() {
      return this.roleLevelName(this.currentHospitalUser.roleLevel, this.currentHospitalUser.isAdmin)
    },
    canEditHospital() {
      return this.currentHospitalUser.isAdmin === '1'
    },
    canViewInvite() {
      return this.canEditHospital || this.inviteAccess || this.permissions.includes('medical:hospital:invite:self')
    }
  },
  created() {
    this.refreshUserPermission()
  },
  methods: {
    refreshUserPermission() {
      this.$store.dispatch('GetInfo').finally(() => {
        this.reload()
      })
    },
    reload() {
      getUserProfile().then(response => { this.user = response.data || {} })
      getCurrentHospital().then(response => { this.currentHospital = response.data || {} })
      listMyHospitals().then(response => {
        this.myHospitals = response.data || []
        this.getInviteInfo()
      })
    },
    getInviteInfo() {
      this.inviteAccess = false
      getCurrentHospitalInvite().then(response => {
        this.currentInvite = response.data || {}
        this.inviteAccess = true
      }).catch(() => {
        this.currentInvite = {}
        this.inviteAccess = false
      })
    },
    startEdit(field, value) {
      this.editingField = field
      this.editValue = value || ''
    },
    cancelEdit() {
      this.editingField = ''
      this.editValue = ''
    },
    saveUserField(field, value) {
      const data = Object.assign({}, this.user, { [field]: value })
      updateUserProfile(data).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.editingField = ''
        this.reload()
      })
    },
    saveHospitalField(field, value) {
      const data = Object.assign({}, this.currentHospital, { [field]: value })
      updateHospital(data).then(() => {
        this.$modal.msgSuccess('保存成功')
        this.editingField = ''
        this.reload()
      })
    },
    submitOwnerPhone() {
      this.$refs.ownerPhoneForm.validate(valid => {
        if (!valid) {
          return
        }
        this.$confirm('确认将当前医院超级管理员权限转让给该手机号用户吗？操作成功后你将不再是本医院超级管理员。', '二次确认', {
          confirmButtonText: '确认换绑',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          return transferOwnerByPhone(this.ownerPhoneForm)
        }).then(() => {
          this.$modal.msgSuccess('换绑成功，请重新登录')
          this.ownerPhoneOpen = false
          this.$store.dispatch('LogOut').then(() => {
            location.href = '/index'
          })
        }).catch(() => {})
      })
    },
    copyInviteCode() {
      const code = this.currentInvite.inviteCode
      if (!code) {
        return
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => this.$modal.msgSuccess('邀请码已复制'))
      } else {
        this.$modal.msgSuccess('邀请码：' + code)
      }
    },
    roleLevelName(roleLevel, isAdmin) {
      if (isAdmin === '1') {
        return '超级管理员'
      }
      const map = { 0: '超级管理员', 10: '合伙人', 20: '管理员', 30: '员工' }
      return map[roleLevel] || '成员'
    },
    hospitalTypeName(type) {
      const item = this.hospitalTypeOptions.find(option => option.value === String(type))
      return item ? item.label : '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  background: #f5f7fa;
}

.profile-hero,
.profile-section {
  margin-bottom: 18px;
  border-radius: 4px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.profile-subtitle {
  margin-top: 8px;
  color: #606266;
  font-size: 13px;
}

.profile-block {
  margin-bottom: 24px;
}

.block-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.base-panel {
  width: 100%;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 420px));
  gap: 8px 32px;
  padding: 18px 22px;
  border-radius: 6px;
  background: #f3f6fa;
  box-sizing: border-box;
  align-items: start;
}

.info-cell {
  min-height: 34px;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  column-gap: 12px;
  font-size: 13px;
}

.info-label {
  color: #7a8794;
}

.info-content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #1f2d3d;
  line-height: 22px;

  strong {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.inline-input {
  width: 168px;
}

.security-panel {
  min-height: 74px;
  padding: 14px 20px;
  border: 1px solid #dfe6ef;
  border-radius: 4px;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  background: #fff;
}

.security-icon {
  color: #606266;
  font-size: 24px;
  text-align: center;
}

.security-title {
  font-weight: 600;
  color: #303133;
}

.security-desc {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.section-title {
  font-weight: 600;
  color: #303133;
}

.invite-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 240px 110px;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: #f7f9fc;
}

.invite-code {
  font-family: Consolas, Monaco, monospace;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.invite-desc {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

.invite-meta {
  color: #606266;
  font-size: 13px;
  line-height: 24px;
}

@media (max-width: 900px) {
  .base-panel {
    grid-template-columns: 1fr;
  }

  .security-panel {
    grid-template-columns: 32px minmax(0, 1fr);
  }
}
</style>
