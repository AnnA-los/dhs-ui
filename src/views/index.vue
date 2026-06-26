<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-kicker">DHS Medical Cloud</div>
        <div class="hero-title-row">
          <h1>诊所一体化经营管理系统</h1>
          <img class="hero-logo-mark" :src="currentLogo" alt="DHS Medical Cloud" />
        </div>
        <p class="hero-desc">
          以患者档案、预约接诊、收费明细、药品耗材、员工权限和经营报表为核心，支撑多诊所独立使用和院内精细化协作。
        </p>
        <div class="hero-actions">
          <el-button type="primary" icon="el-icon-data-analysis" @click="goMenu('经营报表', '/medicalFinance/report')">查看经营报表</el-button>
          <el-button icon="el-icon-user" @click="goMenu('患者档案', '/medicalPatient/patient')">进入患者管理</el-button>
        </div>
        <div class="hero-lower">
          <div class="hero-metrics">
            <div v-for="item in metrics" :key="item.label" class="metric-item">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
          <div class="visual-panel panel-sub">
            <i class="el-icon-lock"></i>
            <div>
              <strong>诊所数据隔离</strong>
              <span>用户可加入多诊所，数据按机构边界独立</span>
            </div>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-panel panel-main">
          <div class="panel-title">今日诊疗看板</div>
          <div class="panel-chart">
            <span style="height: 46%"></span>
            <span style="height: 72%"></span>
            <span style="height: 58%"></span>
            <span style="height: 86%"></span>
            <span style="height: 64%"></span>
          </div>
          <div class="panel-row"><b>预约到诊</b><em>18 / 24</em></div>
          <div class="panel-row"><b>收费完成</b><em>¥ 12,860</em></div>
        </div>
      </div>
    </section>

    <section class="feature-section">
      <div class="section-head">
        <span>核心功能</span>
        <h2>围绕诊所日常经营搭建业务闭环</h2>
      </div>
      <div class="feature-grid">
        <div v-for="item in features" :key="item.title" class="feature-card">
          <div class="feature-icon"><i :class="item.icon"></i></div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
          <div class="feature-tags">
            <span v-for="tag in item.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="workflow-section">
      <div class="workflow-card">
        <div class="section-head compact">
          <span>业务流程</span>
          <h2>从获客预约到收费复诊，全链路留痕</h2>
        </div>
        <div class="timeline">
          <div v-for="(item, index) in workflow" :key="item.title" class="timeline-item">
            <div class="timeline-index">{{ index + 1 }}</div>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="security-card">
        <div class="security-title">
          <i class="el-icon-cpu"></i>
          <span>安全与运营底座</span>
        </div>
        <ul>
          <li v-for="item in security" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script>
import currentLogo from '@/assets/logo/logo.svg'

export default {
  name: 'Index',
  data() {
    return {
      currentLogo,
      metrics: [
        { label: '核心业务模块', value: '12+' },
        { label: '机构级数据隔离', value: '100%' },
        { label: '关键操作留痕', value: '全链路' }
      ],
      features: [
        {
          title: '患者全周期管理',
          icon: 'el-icon-user-solid',
          desc: '沉淀患者档案、预约、病历、回访和收费记录，形成诊疗视图。',
          tags: ['患者档案', '预约管理', '回访管理']
        },
        {
          title: '接诊病历与收费明细',
          icon: 'el-icon-document-checked',
          desc: '病历编号贯穿收费单和明细，药品、耗材、项目消耗自动关联库存。',
          tags: ['接诊病历', '收费明细', '费用单据']
        },
        {
          title: '资产库存管控',
          icon: 'el-icon-box',
          desc: '药品、耗材、器械分表管理，支持批次、阈值告警和消耗回补。',
          tags: ['药品管理', '耗材管理', '库存告警']
        },
        {
          title: '员工与权限协作',
          icon: 'el-icon-s-custom',
          desc: '诊所用户、部门、岗位、角色组合授权，机构负责人掌控院内权限边界。',
          tags: ['医院用户', '部门岗位', '角色权限']
        },
        {
          title: '经营报表分析',
          icon: 'el-icon-data-line',
          desc: '按年、月、天、小时和时间范围统计采购成本、收入和项目使用情况。',
          tags: ['收入统计', '成本分析', '图表切换']
        },
        {
          title: 'SaaS 机构隔离',
          icon: 'el-icon-connection',
          desc: '一个用户可加入多家诊所，每家机构业务数据、角色权限和日志互不串扰。',
          tags: ['诊所切换', '数据隔离', '操作日志']
        }
      ],
      workflow: [
        { title: '预约建档', desc: '前台录入患者和预约信息，自动同步患者档案。' },
        { title: '医生接诊', desc: '医生维护病历、影像和诊疗项目，形成病历编号。' },
        { title: '收费结算', desc: '收费明细自动汇总到收费单，支持折扣、支付类型和费用单据。' },
        { title: '库存联动', desc: '药品耗材使用后扣减库存，到阈值自动通知相关人员。' },
        { title: '复诊运营', desc: '通过回访、操作日志和经营报表追踪服务质量与经营结果。' }
      ],
      security: [
        '机构级 hospital_id 数据隔离',
        '医院 owner 与角色层级权限控制',
        '修改、删除等关键操作记录业务细节',
        '药品耗材库存阈值自动告警通知',
        '费用单据与经营报表实时联动'
      ]
    }
  },
  methods: {
    goMenu(title, fallbackPath) {
      const menuPath = this.findMenuPath(this.$store.state.permission.sidebarRouters || [], title)
      this.$router.push(menuPath || fallbackPath)
    },
    findMenuPath(routes, title, parentPath = '') {
      for (const route of routes) {
        const currentPath = this.joinRoutePath(parentPath, route.path)
        if (route.meta && route.meta.title === title) {
          return currentPath
        }
        if (route.children && route.children.length) {
          const childPath = this.findMenuPath(route.children, title, currentPath)
          if (childPath) {
            return childPath
          }
        }
      }
      return ''
    },
    joinRoutePath(parentPath, path) {
      if (!path) {
        return parentPath
      }
      if (path.startsWith('/')) {
        return path
      }
      if (!parentPath || parentPath === '/') {
        return `/${path}`
      }
      return `${parentPath.replace(/\/$/, '')}/${path}`
    }
  }
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: calc(100vh - 84px);
  padding: 22px;
  color: #243044;
  background:
    linear-gradient(135deg, rgba(248, 238, 247, 0.92), rgba(245, 247, 250, 0.96) 42%, rgba(236, 250, 255, 0.92));
}

.hero-section,
.workflow-section {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(520px, 0.88fr);
  gap: 18px;
}

.hero-section {
  min-height: 430px;
  padding: 30px;
  overflow: hidden;
  align-items: stretch;
  background: linear-gradient(130deg, #ffffff 0%, #fbf7fd 48%, #eefbff 100%);
  border: 1px solid #eaddec;
  border-radius: 8px;
  box-shadow: 0 16px 38px rgba(78, 45, 89, 0.08);
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 370px;
}

.hero-kicker,
.section-head span {
  color: #9c4f86;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}

.hero-title-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 14px;
}

.hero-content h1 {
  max-width: 620px;
  margin: 0;
  color: #1f2937;
  font-size: 38px;
  line-height: 1.22;
  letter-spacing: 0;
}

.hero-desc {
  max-width: 670px;
  margin: 18px 0 0;
  color: #5f6b7a;
  font-size: 15px;
  line-height: 1.9;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.hero-lower {
  display: grid;
  gap: 14px;
  margin-top: 28px;
}

.metric-item {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid #eaddec;
  border-radius: 8px;
}

.metric-item strong {
  display: block;
  color: #1890ff;
  font-size: 24px;
}

.metric-item span {
  display: block;
  margin-top: 6px;
  color: #6b7280;
}

.hero-visual {
  position: relative;
  display: grid;
  align-items: stretch;
  min-height: 370px;
  padding: 28px 18px 0;
}

.hero-logo-mark {
  width: 70px;
  height: 70px;
  flex: 0 0 auto;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(24, 144, 255, 0.16));
}

.visual-panel {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(188, 166, 190, 0.62);
  border-radius: 8px;
  box-shadow: 0 20px 45px rgba(31, 41, 55, 0.1);
  backdrop-filter: blur(8px);
}

.panel-main {
  position: relative;
  z-index: 1;
  justify-self: stretch;
  width: 100%;
  min-height: 360px;
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.panel-title {
  color: #1f2937;
  font-weight: 700;
}

.panel-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex: 1;
  min-height: 190px;
  margin-top: 18px;
  padding: 12px;
  background: linear-gradient(180deg, rgba(24, 144, 255, 0.08), rgba(156, 79, 134, 0.04));
  border-radius: 8px;
}

.panel-chart span {
  flex: 1;
  min-height: 24px;
  background: linear-gradient(180deg, #1890ff, #9c4f86);
  border-radius: 5px 5px 0 0;
}

.panel-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14px;
  color: #667085;
}

.panel-row em {
  color: #1f2937;
  font-style: normal;
  font-weight: 700;
}

.panel-sub {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
}

.panel-sub i {
  color: #1890ff;
  font-size: 26px;
}

.panel-sub strong,
.panel-sub span {
  display: block;
}

.panel-sub span {
  margin-top: 5px;
  color: #6b7280;
  line-height: 1.5;
}

.feature-section {
  margin-top: 18px;
}

.section-head {
  margin-bottom: 14px;
}

.section-head h2 {
  margin: 8px 0 0;
  color: #1f2937;
  font-size: 22px;
  letter-spacing: 0;
}

.section-head.compact {
  margin-bottom: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card,
.workflow-card,
.security-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid #eaddec;
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(78, 45, 89, 0.06);
}

.feature-card {
  min-height: 192px;
  padding: 20px;
}

.feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #fff;
  font-size: 22px;
  background: linear-gradient(135deg, #1890ff, #9c4f86);
  border-radius: 8px;
}

.feature-card h3 {
  margin: 16px 0 0;
  color: #1f2937;
  font-size: 16px;
}

.feature-card p {
  min-height: 44px;
  margin: 10px 0 0;
  color: #667085;
  line-height: 1.65;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.feature-tags span {
  padding: 4px 8px;
  color: #9c4f86;
  background: #f8eef7;
  border: 1px solid #efd7ea;
  border-radius: 4px;
}

.workflow-section {
  margin-top: 18px;
}

.workflow-card,
.security-card {
  padding: 22px;
}

.timeline {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.timeline-item {
  padding: 14px;
  background: #f8fbff;
  border: 1px solid #e4edf8;
  border-radius: 8px;
}

.timeline-index {
  width: 28px;
  height: 28px;
  color: #fff;
  line-height: 28px;
  text-align: center;
  background: #1890ff;
  border-radius: 50%;
}

.timeline-item h3 {
  margin: 12px 0 0;
  color: #1f2937;
  font-size: 15px;
}

.timeline-item p {
  margin: 8px 0 0;
  color: #667085;
  line-height: 1.6;
}

.security-card {
  background: linear-gradient(145deg, #5b3753, #253858);
  color: #fff;
}

.security-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
}

.security-title i {
  font-size: 26px;
}

.security-card ul {
  padding: 0;
  margin: 20px 0 0;
  list-style: none;
}

.security-card li {
  position: relative;
  padding: 11px 0 11px 20px;
  color: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.security-card li::before {
  position: absolute;
  top: 17px;
  left: 0;
  width: 7px;
  height: 7px;
  content: "";
  background: #28d7ff;
  border-radius: 50%;
}

@media (max-width: 1200px) {
  .hero-section,
  .workflow-section {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    min-height: 320px;
    padding: 10px 0 0;
  }

  .hero-content {
    min-height: auto;
  }

  .feature-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .timeline {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 14px;
  }

  .hero-section {
    padding: 20px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .hero-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .hero-logo-mark {
    width: 56px;
    height: 56px;
  }

  .hero-metrics,
  .feature-grid,
  .timeline {
    grid-template-columns: 1fr;
  }

  .panel-main,
  .panel-sub {
    width: auto;
    margin-top: 14px;
  }

  .panel-main {
    min-height: 300px;
  }

}
</style>
