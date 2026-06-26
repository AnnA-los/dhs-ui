# 架构说明

## 技术栈

- Vue 2.6.12
- Vue Router 3.4.9，`history` 模式
- Vuex 3.6.0
- Element UI 2.15.14
- Axios 0.28.1
- ECharts 5.4.0
- Vue CLI 4.4.6
- Sass、svg-sprite-loader、compression-webpack-plugin

## 入口与初始化

入口文件是 `src/main.js`，主要完成：

- 引入全局样式：`src/assets/styles/index.scss`、`src/assets/styles/dhs-ui.scss`、Element 变量。
- 注册全局插件：`src/plugins`、`src/directive`。
- 注册全局组件：分页、右侧工具栏、富文本、文件/图片上传、图片预览、字典标签等。
- 挂载全局工具方法：`parseTime`、`resetForm`、`addDateRange`、`getCurrentMonthRange`、`restoreCurrentMonthRange`、`download` 等。
- 引入 `src/permission.js` 启用路由守卫。

## 配置与代理

环境配置在 `.env.development`、`.env.staging`、`.env.production`。

开发代理在 `vue.config.js`：

- `VUE_APP_BASE_API` 前缀代理到 `http://localhost:8080`。
- `/v3/api-docs/(.*)` 也代理到同一个后端，用于 Swagger/springdoc。
- 默认 dev 端口是 `80`。
- 生产构建关闭 source map，并启用 gzip 产物。

注意：`baseUrl = 'http://localhost:8080'` 是硬编码，换后端地址时优先改这里或通过后续重构改成环境变量。

## 请求封装

统一请求封装在 `src/utils/request.js`。

关键行为：

- baseURL 使用 `process.env.VUE_APP_BASE_API`。
- 默认超时 10 秒。
- token 从 Cookie `Admin-Token` 读取，并以 `Authorization: Bearer <token>` 发送。
- `headers.isToken === false` 表示该请求不带 token。
- `headers.repeatSubmit === false` 表示关闭重复提交校验。
- GET 参数会被手动拼接到 URL，并清空 `config.params`。
- POST/PUT 默认启用 1 秒内同 URL、同数据的重复提交拦截。
- 响应协议按若依风格处理：`code` 缺省视为 `200`；`401` 弹重新登录；`500`、`601`、非 `200` 分别走不同提示。
- blob/arraybuffer 直接返回原始数据。
- `download()` 使用 `application/x-www-form-urlencoded` 发起 POST 并保存文件。

开发新 API 时应放在 `src/api/**`，并复用该 request 实例。

## 登录与权限链路

相关文件：

- `src/views/login.vue`
- `src/views/adminLogin.vue`
- `src/views/register.vue`
- `src/api/login.js`
- `src/store/modules/user.js`
- `src/permission.js`
- `src/store/modules/permission.js`

登录链路：

1. 登录页支持手机号/邮箱作为登录账号，但实际字段仍是 `username`。
2. 普通登录调用 `/login`。
3. 系统超管登录调用 `/adminLogin`。
4. 登录接口返回 token 后写入 Cookie 和 Vuex。
5. 如果返回 `needSelectHospital`，登录页会调用 `/medical/hospital/login-options` 弹出医院选择。
6. 选择医院后调用 `/medical/hospital/select-login/{hospitalUserId}`，后端返回新的 token，前端覆盖旧 token 后进入系统。
7. 路由守卫发现有 token 但 Vuex 里无 roles 时，会调用 `/getInfo` 拉用户、角色、权限，再调用 `/getRouters` 生成动态菜单路由。

权限模型：

- 系统角色和权限来自 `/getInfo`：`roles`、`permissions`。
- 前端按钮权限使用 `checkPermi`、`v-hasPermi` 或 `auth.hasPermi*`。
- 路由权限主要由后端菜单控制；前端 `dynamicRoutes` 只补充用户授权、角色授权、字典数据、调度日志、代码生成编辑等隐藏页。
- `*:*:*` 视为全部权限，`admin` 视为超级角色。

## 路由与菜单

`src/router/index.js` 只定义：

- 公共路由：登录、注册、404/401、首页、个人中心等。
- 隐藏业务路由：`/medical/visitUsage` 收费明细页。
- 少量动态补充路由：系统授权、字典数据、调度日志、代码生成编辑。

业务主菜单不在前端固定配置，而是由 `src/store/modules/permission.js` 调用 `src/api/menu.js` 的 `/getRouters` 获取。后端返回的 `component` 字符串会转换为：

- `Layout` -> `src/layout/index.vue`
- `ParentView` -> `src/components/ParentView`
- `InnerLink` -> `src/layout/components/InnerLink`
- 其他 -> `src/views/${component}`

因此新增业务页面时，需要同时确认后端菜单 `component` 字段与前端真实文件路径一致。

## 布局

主布局在 `src/layout/index.vue`：

- 左侧菜单 `Sidebar`
- 顶部栏 `Navbar`
- 标签页 `TagsView`
- 内容区 `AppMain`
- 布局设置 `Settings`

`src/layout/components/Navbar.vue` 承载医院上下文：

- 当前医院和当前医院用户展示。
- 医院切换。
- 医院通知。
- 系统工具入口对 admin 或 `*:*:*` 可见。

`src/layout/components/AppMain.vue` 使用 keep-alive 缓存标签页，并特殊处理 iframe 页面。

## Store 模块

主要 Vuex 模块：

- `user`：token、用户信息、roles、permissions、登录/登出/拉用户信息。
- `permission`：后端菜单、侧边栏路由、顶部路由、动态路由。
- `tagsView`：标签页与缓存视图。
- `settings`：主题、布局、标题、tagsView 等。
- `app`：侧边栏、设备类型等。
- `dict`：字典缓存。

## 目录结构

```text
src/
  api/              API 封装，medical 为业务接口
  assets/           样式、图标、图片、logo
  components/       通用组件
  directive/        权限、拖拽、剪贴板等指令
  layout/           管理后台布局
  plugins/          modal、download、cache、auth、tab 等全局插件
  router/           公共路由和隐藏路由
  store/            Vuex
  utils/            请求、工具函数、字典、加密、权限等
  views/
    medical/        医疗业务页面
    system/         若依系统管理
    monitor/        监控
    tool/           代码生成、表单构建、Swagger
```

