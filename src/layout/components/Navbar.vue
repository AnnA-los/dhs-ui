<template>
  <div class="navbar" :class="'nav' + navType">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb v-if="navType == 1" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="navType == 2" id="topmenu-container" class="topmenu-container" />
    <template v-if="navType == 3">
      <logo v-show="showLogo" :collapse="false"></logo>
      <top-bar id="topbar-container" class="topbar-container" />
    </template>
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <search id="header-search" class="right-menu-item" />

        <el-tooltip v-if="showSystemTools" content="源码地址" effect="dark" placement="bottom">
          <dhs-ui-git id="dhs-ui-git" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip v-if="showSystemTools" content="文档地址" effect="dark" placement="bottom">
          <dhs-ui-doc id="dhs-ui-doc" class="right-menu-item hover-effect" />
        </el-tooltip>

        <screenfull v-if="showSystemTools" id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip v-if="showSystemTools" content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-popover v-if="showHospitalNotification" placement="bottom-end" width="380" trigger="click" popper-class="hospital-notification-popper" class="notification-popover" @show="loadNotifications">
          <div class="notification-panel">
            <div class="notification-title">消息</div>
            <div v-if="notifications.length === 0" class="notification-empty">暂无消息</div>
            <div
              v-for="item in notifications"
              :key="item.notificationId"
              class="notification-item"
              :class="{ unread: item.readStatus === '0' }"
              @click="markNotificationRead(item)"
            >
              <div class="notification-item-header">
                <div class="notification-item-title">{{ item.noticeTitle }}</div>
                <el-tag size="mini" :type="notificationTypeTag(item.businessType)">{{ notificationTypeName(item.businessType) }}</el-tag>
              </div>
              <div class="notification-item-content">{{ item.noticeContent }}</div>
              <div class="notification-item-time">{{ item.createTime }}</div>
            </div>
          </div>
          <span slot="reference" class="right-menu-item hover-effect notification-trigger">
            <el-badge :value="unreadNotifications" :hidden="!unreadNotifications" :max="99">
              <i class="el-icon-bell"></i>
            </el-badge>
          </span>
        </el-popover>
      </template>

      <el-dropdown class="hospital-container right-menu-item hover-effect" trigger="click" @command="handleHospitalCommand">
        <div class="hospital-wrapper">
          <img :src="avatar" class="user-avatar" @error="handleAvatarError">
          <span class="hospital-name">{{ currentHospitalName }}</span>
          <el-tag size="mini" effect="plain">{{ currentRoleName }}</el-tag>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </div>
        <el-dropdown-menu slot="dropdown" class="hospital-dropdown">
          <div class="hospital-dropdown-header">
            <div class="hospital-dropdown-info">
              <div class="hospital-dropdown-name">{{ currentHospitalName }}</div>
              <div class="hospital-dropdown-account">登录账号：{{ currentAccount }}</div>
            </div>
            <el-button
              v-if="myHospitals.length > 1"
              type="text"
              icon="el-icon-sort"
              class="hospital-dropdown-switch"
              @click.stop="switchOpen = true"
            >切换</el-button>
          </div>
          <router-link to="/user/profile">
            <el-dropdown-item icon="el-icon-user">个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item v-if="showSystemLayoutSetting" icon="el-icon-setting" command="layout">布局设置</el-dropdown-item>
          <el-dropdown-item divided icon="el-icon-switch-button" command="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-dialog title="切换医院" :visible.sync="switchOpen" width="520px" append-to-body>
      <div class="hospital-select-list">
        <div
          v-for="item in myHospitals"
          :key="item.hospitalUserId"
          class="hospital-select-item"
          :class="{ current: isCurrentHospital(item) }"
          @click="isCurrentHospital(item) ? null : switchHospital(item.hospitalUserId)"
        >
          <div>
            <div class="hospital-select-name">{{ item.hospitalName }}</div>
            <div class="hospital-select-meta">{{ roleLevelName(item.roleLevel, item.isAdmin) }} · {{ item.deptName || '未分配部门' }}</div>
          </div>
          <el-tag v-if="isCurrentHospital(item)" size="mini">当前医院</el-tag>
          <el-button v-else type="primary" size="mini">进入</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import TopBar from './TopBar'
import Logo from './Sidebar/Logo'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import DhsUiGit from '@/components/DhsUi/Git'
import DhsUiDoc from '@/components/DhsUi/Doc'
import { getCurrentHospital, listMyHospitals, switchHospital } from '@/api/medical/hospital'
import { mineHospitalNotifications, readHospitalNotification } from '@/api/medical/hospitalNotification'
import defAva from '@/assets/images/profile.jpg'

export default {
  emits: ['setLayout'],
  components: {
    Breadcrumb,
    Logo,
    TopNav,
    TopBar,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    DhsUiGit,
    DhsUiDoc
  },
  data() {
    return {
      currentHospital: {},
      myHospitals: [],
      notifications: [],
      unreadNotifications: 0,
      switchOpen: false,
      hospitalContextLoaded: false,
      navbarContextTimer: null
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'name',
      'nickName',
      'roles',
      'permissions'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      }
    },
    showSystemLayoutSetting() {
      return this.setting && this.isSystemAdmin
    },
    showSystemTools() {
      return this.isSystemAdmin
    },
    isSystemAdmin() {
      return this.roles.includes('admin') || this.permissions.includes('*:*:*')
    },
    authReady() {
      return this.roles.length > 0 || this.permissions.length > 0
    },
    showHospitalNotification() {
      return !this.showSystemTools && !!this.currentHospitalUser.hospitalUserId
    },
    navType: {
      get() {
        return this.$store.state.settings.navType
      }
    },
    showLogo: {
      get() {
        return this.$store.state.settings.sidebarLogo
      }
    },
    currentHospitalUser() {
      return this.myHospitals.find(item => this.isCurrentHospital(item)) || this.myHospitals.find(item => item.hospitalId === this.currentHospital.hospitalId) || {}
    },
    currentHospitalName() {
      if (this.showSystemTools) {
        return '系统管理后台'
      }
      return this.currentHospital.hospitalName || this.currentHospitalUser.hospitalName || '未选择医院'
    },
    currentRoleName() {
      if (this.showSystemTools) {
        return '系统超管'
      }
      return this.roleLevelName(this.currentHospitalUser.roleLevel, this.currentHospitalUser.isAdmin)
    },
    currentAccount() {
      return this.currentHospitalUser.phonenumber || this.name
    }
  },
  created() {
    this.scheduleNavbarContextRefresh()
  },
  beforeDestroy() {
    window.clearTimeout(this.navbarContextTimer)
  },
  watch: {
    roles() {
      this.scheduleNavbarContextRefresh()
    },
    permissions() {
      this.scheduleNavbarContextRefresh()
    }
  },
  methods: {
    handleAvatarError(event) {
      if (event && event.target && !event.target.dataset.fallbackAvatar) {
        event.target.dataset.fallbackAvatar = 'true'
        event.target.src = defAva
      }
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    setLayout() {
      this.$emit('setLayout')
    },
    scheduleNavbarContextRefresh() {
      window.clearTimeout(this.navbarContextTimer)
      this.navbarContextTimer = window.setTimeout(() => {
        this.refreshNavbarContext()
      }, 0)
    },
    refreshNavbarContext() {
      if (!this.authReady) {
        return
      }
      if (this.isSystemAdmin) {
        this.clearHospitalContext()
        this.hospitalContextLoaded = true
        return
      }
      if (this.hospitalContextLoaded) {
        return
      }
      this.hospitalContextLoaded = true
      this.loadMyHospitals()
    },
    clearHospitalContext() {
      this.currentHospital = {}
      this.myHospitals = []
      this.notifications = []
      this.unreadNotifications = 0
      this.switchOpen = false
    },
    loadMyHospitals() {
      if (this.isSystemAdmin) {
        this.clearHospitalContext()
        return
      }
      getCurrentHospital().then(response => {
        this.currentHospital = response.data || {}
      }).catch(() => {
        this.currentHospital = {}
      })
      listMyHospitals().then(response => {
        this.myHospitals = response.data || []
        this.loadNotifications()
      }).catch(() => {
        this.myHospitals = []
      })
    },
    isCurrentHospital(item) {
      return item && (item.isCurrent === '1' || item.isCurrent === 1 || item.hospitalId === this.currentHospital.hospitalId)
    },
    handleHospitalCommand(command) {
      if (!command) {
        return
      }
      if (command === 'logout') {
        this.logout()
        return
      }
      if (command === 'layout') {
        this.setLayout()
        return
      }
    },
    switchHospital(hospitalUserId) {
      switchHospital(hospitalUserId).then(() => {
        this.$modal.msgSuccess('医院切换成功')
        window.location.reload()
      })
    },
    loadNotifications() {
      if (!this.showHospitalNotification) {
        this.notifications = []
        this.unreadNotifications = 0
        return
      }
      mineHospitalNotifications().then(response => {
        this.notifications = response.rows || []
        this.unreadNotifications = response.unread || 0
      }).catch(() => {
        this.notifications = []
        this.unreadNotifications = 0
      })
    },
    markNotificationRead(item) {
      if (!item || item.readStatus !== '0') {
        return
      }
      readHospitalNotification(item.notificationId).then(() => {
        item.readStatus = '1'
        this.unreadNotifications = Math.max(0, this.unreadNotifications - 1)
      })
    },
    notificationTypeName(businessType) {
      if (businessType === 'SYSTEM_MESSAGE') {
        return '系统消息'
      }
      return '医院消息'
    },
    notificationTypeTag(businessType) {
      return businessType === 'SYSTEM_MESSAGE' ? 'primary' : 'info'
    },
    roleLevelName(roleLevel, isAdmin) {
      if (isAdmin === '1') {
        return '超级管理员'
      }
      const map = { 0: '超级管理员', 10: '合伙人', 20: '管理员', 30: '员工' }
      return map[roleLevel] || '成员'
    },
    logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index'
        })
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar.nav3 {
  .hamburger-container {
    display: none !important;
  }
}

.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fbf3fa;
  box-shadow: 0 1px 4px rgba(137, 82, 124, .12);
  display: flex;
  align-items: center;
  box-sizing: border-box;

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-right: 8px;

    &:hover {
      background: rgba(0, 0, 0, .025);
    }
  }

  .breadcrumb-container {
    flex-shrink: 0;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .topbar-container {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    margin-left: 8px;
  }

  .right-menu {
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    margin-left: auto;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025);
        }
      }
    }

    .hospital-container {
      padding: 0 12px 0 8px;

      .hospital-wrapper {
        height: 50px;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
        }

        .hospital-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 14px;
          font-weight: 600;
          color: #5b3753;
        }
      }
    }
  }
}

.hospital-dropdown {
  min-width: 260px;
}

.hospital-dropdown-header {
  padding: 10px 16px 8px 16px;
  border-bottom: 1px solid #ebeef5;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.hospital-dropdown-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.hospital-dropdown-account {
  font-size: 12px;
  color: #606266;
}

.hospital-dropdown-info {
  min-width: 0;
}

.hospital-dropdown-switch {
  flex-shrink: 0;
  font-size: 14px;
}

.hospital-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hospital-select-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &.current {
    cursor: default;
    background: #f8eef7;
  }
}

.hospital-select-name {
  font-weight: 600;
  color: #303133;
}

.hospital-select-meta {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.notification-trigger {
  height: 50px;
  line-height: 50px;
  vertical-align: middle;
}

.notification-popover {
  height: 50px;
  line-height: 50px;
  display: inline-block;
}

.notification-trigger ::v-deep .el-badge {
  line-height: 50px;
  vertical-align: middle;
}

.notification-trigger ::v-deep .el-badge__content {
  top: 9px;
}

.notification-trigger i {
  font-size: 22px;
  font-weight: 700;
  -webkit-text-stroke: 1px #5a5e66;
  vertical-align: middle;
}

.notification-panel {
  max-height: 360px;
  overflow-y: auto;
}

.notification-title {
  padding-bottom: 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 600;
  color: #303133;
}

.notification-empty {
  padding: 24px 0;
  text-align: center;
  color: #909399;
}

.notification-item {
  padding: 10px 0;
  border-bottom: 1px solid #ecd8e8;
  cursor: pointer;
}

.notification-item.unread .notification-item-title::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  border-radius: 50%;
  background: #f56c6c;
  vertical-align: middle;
}

.notification-item-title {
  font-weight: 600;
  color: #303133;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.notification-item-content {
  margin-top: 6px;
  color: #606266;
  font-size: 12px;
  line-height: 18px;
}

.notification-item-time {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
