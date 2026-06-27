# 架构基线与功能模块总览

本文是 `dhs-ui` 的系统功能模块架构基线。后续新增功能、拆分模块、调整模块职责时，必须同步更新本文，避免新会话、新模型或新 agent 只看到旧模块边界而误判业务。

## 适用范围与事实基线

- 仓库：`E:\workFile\dhs-ui`
- 项目：`dhs-ui`
- 系统定位：医疗管理后台前端，前后端分离；后端系统是 `dhs-core`
- 技术栈：Vue 2.6.12、Vue Router 3.4.9、Vuex 3.6.0、Element UI 2.15.14、Axios 0.28.1、ECharts 5.4.0、Vue CLI 4.4.6、Sass
- 启动入口：`src/main.js`
- 根组件：`src/App.vue`
- 路由入口：`src/router/index.js`
- 路由守卫：`src/permission.js`
- Store 入口：`src/store/index.js`
- 请求封装：`src/utils/request.js`
- 主布局：`src/layout/index.vue`
- 开发配置：`.env.development`、`vue.config.js`
- 测试/生产配置：`.env.staging`、`.env.production`
- 静态资源：`public/`、`src/assets/`
- API 目录：`src/api/`，医疗业务集中在 `src/api/medical/`
- 页面目录：`src/views/`，医疗业务集中在 `src/views/medical/`
- 公共组件：`src/components/`，医疗业务公共组件优先放 `src/views/medical/components/`
- 项目核心文档：`docs/project/`
- UI 设计文档：`docs/ui/`
- 默认本地端口：`80`
- 开发代理目标：`http://localhost:8080`
- 前端 API 前缀：开发 `/dev-api`，测试 `/stage-api`，生产 `/prod-api`
- 构建命令：`npm run build:stage`、`npm run build:prod`
- 启动命令：`npm run dev`

## 基线维护规则

- 新增一级模块、业务域或明显独立能力时，必须在本文新增条目。
- 给已有模块加功能时，直接更新对应模块说明，不另开同类模块。
- 如果新增页面依赖后端菜单，要同步记录菜单标题、前端组件路径、API 文件和关键权限/字典。
- 如果某模块存在临时方案、历史兼容或不能随手改的处理，要在本文简写，并在对应功能文档或 `pitfalls.md` 中补充细节。
- 每次需求完结前检查本文是否需要更新。

## 当前架构主线

1. 登录注册模块负责账号登录、验证码、注册、医院选择和 token 初始化。
2. 路由权限模块负责 `/getInfo`、`/getRouters`、动态菜单、按钮权限和页面访问控制。
3. 医院上下文模块负责当前医院、医院切换、医院组织和医院内角色，是所有医疗业务的数据隔离基础。
4. 诊疗主链模块由患者、预约、接诊病历、收费明细、收费单组成，任何改动都要按完整链路验证。
5. 库存与资料模块由药品、耗材、项目、加工定制、设备、材料组成，为收费明细和报表提供基础数据。
6. 经营支撑模块由排班、随访、经营报表、业务日志组成，默认按当前医院和当前自然月聚合或查询。
7. 平台基础模块保留若依系系统管理、系统监控、工具/代码生成、Swagger 等能力。
8. 文档资产模块由 `AGENTS.md`、`docs/project/`、`docs/ui/` 共同维护；新增模块或重大调整必须同步更新文档。

## 平台壳层

### 登录注册与会话

相关文件：

- `src/views/login.vue`
- `src/views/adminLogin.vue`
- `src/views/register.vue`
- `src/api/login.js`
- `src/store/modules/user.js`
- `src/utils/auth.js`

能力边界：

- 普通登录、系统超管登录。
- 历史基线支持手机号/邮箱登录与注册；2026-06-27 手机号化需求要求收敛为只保留手机号登录与注册。
- 验证码。
- 记住密码。
- 注册时支持邀请码加入医院，或无邀请码创建/绑定医院主体。
- 登录后可能需要选择医院，选择后后端返回新 token。

基线风险：

- `needSelectHospital` 分支不能删除。
- 医院选择后的新 token 才代表最终业务身份。

### 路由菜单与权限

相关文件：

- `src/permission.js`
- `src/router/index.js`
- `src/store/modules/permission.js`
- `src/api/menu.js`
- `src/utils/permission.js`
- `src/plugins/auth.js`
- `src/directive/permission`

能力边界：

- token 路由守卫。
- `/getInfo` 拉取用户、角色、权限。
- `/getRouters` 拉取后端菜单并动态生成路由。
- `Layout`、`ParentView`、`InnerLink` 特殊组件映射。
- `v-hasPermi`、`v-hasRole`、`checkPermi`、`checkRole`。

基线风险：

- 业务主菜单由后端下发，不能只看前端 router 判断页面是否存在。
- 新增菜单页要同步后端菜单 `component` 路径。

### 布局与全局交互

相关文件：

- `src/layout/index.vue`
- `src/layout/components/Navbar.vue`
- `src/layout/components/Sidebar`
- `src/layout/components/TagsView`
- `src/layout/components/AppMain.vue`
- `src/layout/components/Settings`
- `src/store/modules/tagsView.js`
- `src/store/modules/settings.js`
- `src/store/modules/app.js`

能力边界：

- 左侧菜单、顶部栏、顶部菜单模式、tagsView、页面缓存。
- 当前医院展示、医院切换、医院通知。
- 布局设置、主题、固定头部、设备适配。

基线风险：

- 医院切换成功后保留整页刷新。
- 组件 `name` 和路由 `name` 影响 keep-alive/tagsView。

### 全局请求、下载、工具

相关文件：

- `src/utils/request.js`
- `src/plugins/download.js`
- `src/plugins/modal.js`
- `src/plugins/cache.js`
- `src/utils/dhs-ui.js`
- `src/utils/dict`

能力边界：

- axios baseURL、token、错误处理、401 重新登录、重复提交拦截。
- 通用下载。
- 日期、树、参数序列化、字典回显、表单重置等工具。

基线风险：

- 业务 API 不要绕过 `request.js`。
- GET 参数序列化适配若依后端，复杂参数需谨慎。
- POST/PUT 默认 1 秒重复提交拦截。

## 平台基础模块

### 系统管理

相关目录：

- `src/views/system`
- `src/api/system`

能力边界：

- 平台用户、角色、菜单、部门、岗位。
- 字典、参数配置、通知公告、密钥/加密配置。
- 个人中心扩展了医院资料、邀请码、owner 手机号转让等医疗业务能力。

基线风险：

- 系统角色/权限与医院角色/权限不是同一套。
- 个人中心同时承载平台用户资料和当前医院资料，改动前要区分字段归属。

### 系统监控

相关目录：

- `src/views/monitor`
- `src/api/monitor`

能力边界：

- 在线用户、登录日志、操作日志、服务监控、缓存监控、定时任务、Druid。

基线风险：

- 这些模块多继承若依模板，接口结构和权限标识通常与后端框架保持一致。

### 工具与低代码

相关目录：

- `src/views/tool`
- `src/api/tool`
- `src/utils/generator`

能力边界：

- 代码生成。
- 表单构建。
- Swagger 页面嵌入。

基线风险：

- 代码生成/表单构建属于平台工具，不应和医疗业务组件混在一起。
- Swagger 访问依赖 dev/prod API 代理或网关转发。

## 医疗业务模块

### 医院组织与多医院上下文

相关目录：

- `src/views/medical/hospital/**`
- `src/api/medical/hospital*.js`

能力边界：

- 当前医院、我的医院、登录医院选择、切换医院。
- 医院资料维护。
- 医院部门、岗位、医院角色、医院用户。
- 邀请码、医院通知。
- owner 手机号转让。

基线风险：

- 当前医院上下文由 token/后端会话决定，不要在前端业务表单里手传 `hospitalId`。
- 医院 owner 不允许在医院用户列表中编辑、授权、删除。
- 医院切换后必须刷新整页。

### 患者档案

相关文件：

- `src/views/medical/patient/index.vue`
- `src/api/medical/patient.js`

能力边界：

- 患者列表、搜索、新增、编辑、删除。
- 患者 options 供预约、病历、收费单等模块远程选择。

基线风险：

- 编辑患者时不要回传 `privacyAuth`。
- 患者是预约、病历、收费的上游基础资料。

### 预约管理

相关文件：

- `src/views/medical/appointment/index.vue`
- `src/api/medical/appointment.js`

能力边界：

- 预约列表、患者/医生/类型/状态/时间筛选。
- 新增、编辑、删除预约。
- 已签到预约可跳转新增接诊病历。
- 预约类型复用医疗类型 `VISIT`。

基线风险：

- 默认当前自然月查询，清空日期恢复当前月。
- 医生下拉要保留历史医生回显。
- 跳病历路径通过后端菜单标题查找，兼容菜单路径变化。

### 接诊病历

相关文件：

- `src/views/medical/visit/index.vue`
- `src/views/medical/components/VisitPaperDetail.vue`
- `src/api/medical/visit.js`

能力边界：

- 病历列表、患者/医生/类型/时间筛选。
- 新增、编辑、删除、详情。
- 从预约带入患者、医生、类型、时间。
- 进入收费明细。
- 查看费用单据。

基线风险：

- 默认当前自然月查询，清空日期恢复当前月。
- 已有病历编辑时关键关联字段禁用。
- 病历提交后会生成收费单，最终由后端实现。

### 收费明细

相关文件：

- `src/views/medical/visitUsage/index.vue`
- `src/api/medical/visitUsage.js`

能力边界：

- 隐藏路由 `/medical/visitUsage`。
- 按 `visitId` 管理病历收费明细。
- 明细类型包括药品、耗材、项目、加工定制、其他。
- 药品/耗材受库存可用量约束。

基线风险：

- 必须从病历带 `visitId` 进入。
- 编辑药品/耗材明细时，可用量要加回原用量。
- 项目/加工定制只选可售数据。

### 收费单

相关文件：

- `src/views/medical/charge/index.vue`
- `src/api/medical/charge.js`

能力边界：

- 收费单列表、患者/病历/状态/时间筛选。
- 新增、编辑收费单。
- 支付类型、折扣、已收、退款、作废。
- 查看费用单据和明细。

基线风险：

- 默认当前自然月查询，清空日期恢复当前月。
- 折扣比例是实际收取比例，不是减免比例。
- 支付类型前端数组、后端逗号字符串。
- 除作废外，状态应由金额和退款自动计算，前端不要随意开放全状态编辑。

### 药品与耗材库存资料

相关文件：

- `src/views/medical/medicine`
- `src/views/medical/consumable/index.vue`
- `src/api/medical/medicine.js`
- `src/api/medical/consumable.js`

能力边界：

- 药品/耗材列表、新增、编辑、删除。
- 类型、采购批次、采购数量、剩余数量、单价、售价/告警阈值。
- options 供收费明细选择。

基线风险：

- 剩余数量不是普通资料字段，只有库存权限才能改。
- 药品权限：`medical:medicine:stock`。
- 耗材权限：`medical:consumable:stock`。

### 项目、加工定制、设备、材料

相关文件：

- `src/views/medical/project`
- `src/views/medical/customWork`
- `src/views/medical/equipment`
- `src/views/medical/material`
- `src/api/medical/project.js`
- `src/api/medical/customWork.js`
- `src/api/medical/equipment.js`
- `src/api/medical/material.js`

能力边界：

- 医疗项目资料。
- 加工定制资料。
- 设备、材料资料。
- 项目/加工定制 options 供收费明细选择。

基线风险：

- 被收费明细使用的资料要关注 `saleStatus`、`sourceType` 等业务过滤。
- 新增资料模块时优先复用类型管理、表格高度、分页、远程 options 模式。

### 排班与随访

相关文件：

- `src/views/medical/schedule/index.vue`
- `src/views/medical/followup/index.vue`
- `src/api/medical/schedule.js`
- `src/api/medical/followup.js`

能力边界：

- 医院员工排班。
- 2026-06-27 排班增强：排班页维护当前医院营业时间；排班新增/编辑使用日期范围提交，后端按日期生成单日记录；员工下拉只展示姓名，手机号以只读字段单独展示；列表保留部门、岗位并新增手机号和超营业时间标记。
- 患者随访记录。
- 远程选择医院用户/患者。

基线风险：

- 日期范围默认和快捷项按 6.27 公共时间范围约定处理，清空后恢复默认范围，最大不超过一年。
- 医院用户 options 受当前医院上下文影响。
- 排班弹窗不回填部门、岗位、角色或层级，但列表展示仍来自后端关联字段，不能误删。
- 排班超出营业时间或休息规则时，前端首次提交不带 `businessHoursConfirmed`；后端拒绝后弹二次确认，继续保存时重提并带 `businessHoursConfirmed=true`。

### 报表与业务日志

相关文件：

- `src/views/medical/report`
- `src/views/medical/businessLog/index.vue`
- `src/api/medical/report.js`
- `src/api/medical/businessLog.js`

能力边界：

- 经营概览：患者数、预约数、接诊数、收费单数、实收金额、库存预警。
- 采购成本、收入、利润。
- 药品、耗材、项目使用统计。
- 业务日志查询。

基线风险：

- 报表默认当前自然月。
- 报表数据以后端聚合为准，前端只负责展示维度和图表形态。

### 通用医疗类型

相关文件：

- `src/views/medical/components/TypeManageDialog.vue`
- `src/api/medical/type.js`

能力边界：

- 医疗业务类型 options。
- 当前类型弹窗主要支持删除已有类型。
- 常见 `typeCategory`：`VISIT`、`MEDICINE`、`PROJECT`，其他以后端约定为准。

基线风险：

- 预约类型和病历类型当前都使用 `VISIT`。
- 类型弹窗不是完整 CRUD，新增/编辑能力扩展前要确认后端设计。

## 模块新增记录模板

后续新增模块时，把以下模板复制到对应分组下：

```md
### 模块名称

相关文件：

- `src/views/...`
- `src/api/...`

能力边界：

- ...

基线风险：

- ...

后续扩展注意：

- ...
```

