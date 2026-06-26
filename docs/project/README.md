# DHS UI 项目接手总览

本文档集用于帮助新会话、新模型或新开发者快速接手 `dhs-ui`。请先读本文件，再按需阅读同目录其他文档。

## 项目定位

`dhs-ui` 是一个基于 Vue2、Vue Router、Vuex、Element UI 的医疗管理后台前端。工程明显继承自若依 Vue 管理后台体系，保留了系统管理、权限菜单、监控、代码生成、Swagger、字典、上传下载等通用能力，并在此基础上扩展医疗业务模块。

核心业务是面向医院/诊所的多机构医疗经营管理：

- 用户注册/登录、邀请码加入医院、登录后选择医院。
- 医院组织管理：医院资料、部门、岗位、医院用户、医院角色、通知、邀请码、超级管理员转让。
- 患者、预约、接诊病历、收费明细、收费单、随访、排班。
- 药品、耗材、项目、加工定制、设备、材料等经营/库存相关资料。
- 经营报表、业务日志。

## 文档阅读顺序

1. [architecture.md](./architecture.md)：技术栈、运行机制、目录和关键链路。
2. [architecture-baseline.md](./architecture-baseline.md)：系统事实基线、当前架构主线和功能模块边界；后续新增功能必须同步更新。
3. [business.md](./business.md)：核心业务域、业务流程和状态码。
4. [risks-and-legacy.md](./risks-and-legacy.md)：历史特殊处理、主要风险、不能随手改的地方。
5. [pitfalls.md](./pitfalls.md)：高频踩坑、根因、解决方案。
6. [development-guide.md](./development-guide.md)：新增功能、调试、联调、发布前检查清单。

## 快速启动

```bash
npm install
npm run dev
```

默认开发端口是 `80`，开发代理目标在 `vue.config.js` 中写死为 `http://localhost:8080`，前端请求前缀由 `.env.*` 的 `VUE_APP_BASE_API` 控制：

- development: `/dev-api`
- staging: `/stage-api`
- production: `/prod-api`

## 最重要的接手提醒

- 菜单和绝大多数业务路由由后端 `/getRouters` 下发，前端路由文件只保留公共路由、隐藏路由和少量补充动态路由。
- 功能模块边界以 `architecture-baseline.md` 为准；后续新增功能、新增模块、拆分模块、调整模块职责时必须及时补充。
- 医疗业务强依赖“当前医院”上下文，登录后可能需要二次选择医院并换 token，顶部切换医院会整页刷新。
- 不要绕过 `src/utils/request.js` 直接用 axios；token、重复提交、错误提示、下载都集中在那里。
- 不要随意删除日期默认当前月、清空后恢复当前月的逻辑，这是医疗列表和报表的查询保护。
- 病历、收费明细、收费单、库存/项目之间存在隐含联动，前端只做部分金额和数量限制，最终一致性依赖后端。
- 角色权限分两层：若依系统角色/权限和医院内角色/层级。医院 owner/super admin 相关操作尤其敏感。
