# 开发接手指南

## 需求分支与双仓协同

从需求文档、开发设计或测试用例阶段开始，就要先在对应仓库 worktree 创建需求主分支，后续文档也在该分支下创建和维护。

同一个需求通常会同时涉及 `dhs-core` 和 `dhs-ui`。两边的需求主分支名称应保持一致，作为后续子任务分支最终合并回来的主分支。即使用户只在 core 或只在 ui 发起说明，开发时也要按双仓协同思路检查接口、菜单、权限、UI、测试和文档是否需要同步。

子任务分支按实际需要创建：只改 core 的子任务不要求 ui 创建同名子任务分支，只改 ui 的子任务也不要求 core 创建同名子任务分支。需要两边同时开发的子任务，建议两边子任务分支名称也保持一致。

需求完结时，要确认：

- 文档和代码都在需求主分支下。
- `dhs-core` 与 `dhs-ui` 的需求主分支名称一致，或已说明不一致原因。
- 子任务分支已合并回需求主分支。
- 两边设计文档、UI 文档、接口约定、测试用例能互相追溯。

## 新增业务页面流程

1. 在 `src/views/medical/<module>/index.vue` 新增页面，优先复制同类 CRUD 页面结构。
2. 在 `src/api/medical/<module>.js` 封装 API，统一使用 `@/utils/request`。
3. 如果页面需要出现在菜单，后端 `/getRouters` 对应菜单必须配置正确的 component 路径。
4. 如果页面是隐藏跳转页，可参考 `/medical/visitUsage` 在 `src/router/index.js` 的 `constantRoutes` 中补充。
5. 页面 name 要唯一，且不要随意改已有 name，避免 tagsView/keep-alive 异常。
6. 按业务权限加按钮权限，优先使用现有 `v-hasPermi`、`checkPermi` 或同类页面模式。

## 新增 API 约定

API 文件推荐形态：

```js
import request from '@/utils/request'

export function listXxx(query) {
  return request({ url: '/medical/xxx/list', method: 'get', params: query })
}

export function getXxx(id) {
  return request({ url: '/medical/xxx/' + id, method: 'get' })
}

export function addXxx(data) {
  return request({ url: '/medical/xxx', method: 'post', data })
}

export function updateXxx(data) {
  return request({ url: '/medical/xxx', method: 'put', data })
}

export function delXxx(id) {
  return request({ url: '/medical/xxx/' + id, method: 'delete' })
}
```

不要直接引入 axios。需要无 token 或关闭重复提交时，通过 headers 明确声明。

## 表格页面约定

医疗列表普遍使用：

- `medicalTableHeight` mixin 固定表格高度，避免少量数据时表格塌陷。
- `RightToolbar` 刷新和搜索区域控制。
- `Pagination` 分页。
- `pageNum`、`pageSize`、`params` 的若依风格查询对象。

如果是时间范围筛选，优先沿用：

- `getCurrentMonthRange()`
- `getCurrentMonthTimeRange()`
- `restoreCurrentMonthRange()`
- `addDateRange()`

不要默认空时间范围，除非业务明确要求全量查询。

## 远程下拉与历史回显

患者、医生、项目、药品等经常使用 remote select 或 autocomplete。编辑历史数据时要注意：

- 当前值可能已被停用、删除或不在当前筛选条件中。
- 预约编辑通过 `currentDoctorOption()` 和 `mergeDoctorOptions()` 保证历史医生能回显。
- 收费明细编辑通过当前明细的 `availableQuantity + usedQuantity` 保证原数量可保存。

新增类似功能时，要考虑“历史数据回显”而不只是“新增时可选择”。

## 医院上下文开发准则

- 不要在前端表单中暴露或手填 `hospitalId`。
- 不要缓存跨医院的 options，除非切换医院后会强制刷新。
- 医院切换后保留 `window.location.reload()`。
- 新增顶部栏、个人中心、医院用户相关功能时，分清系统超管与医院超级管理员。

## 收费与库存开发准则

涉及收费、库存、报表时，前端只做交互和基础校验：

- 金额和数量最终以接口返回或后端保存结果为准。
- 不要仅靠前端计算更新库存。
- 退款、作废、折扣状态要与后端规则对齐。
- 修改收费明细后，应确认收费单和报表是否需要后端同步重算。

## 字典与类型

若依字典：

- 字典组件通过 `dicts: ['xxx']` 加载，如收费单的 `medical_payment_type`。
- 展示使用 `<dict-tag>` 或 `selectDictLabels`。

医疗类型：

- 使用 `/medical/type/options`。
- `typeCategory` 已知值包括 `VISIT`、`MEDICINE`，其他模块参照后端约定。
- `TypeManageDialog` 当前主要支持删除类型，不是完整新增/编辑类型管理。

## 构建与验证

常用命令：

```bash
npm run dev
npm run build:stage
npm run build:prod
npm run preview
```

当前项目没有 test/lint 脚本。代码修改后的最低验证建议：

- 运行 `npm run build:prod`。
- 浏览器验证登录、验证码、医院选择。
- 验证后端菜单能加载新增/修改页面。
- 验证当前医院切换后页面数据刷新。
- 医疗核心链路至少走一遍：新增预约 -> 签到/转病历 -> 新增病历 -> 维护收费明细 -> 查看/修改收费单。

## 发布注意

- 生产 publicPath 当前是 `/`，如果部署到子路径必须改 `vue.config.js`。
- history 模式需要服务端配置 fallback 到 `index.html`。
- 生产 API 前缀为 `/prod-api`，需要网关/nginx 转发到后端。
- gzip 产物会生成，但不会删除原始资源，nginx 是否启用 gzip_static 取决于部署配置。

## 常见排查路径

- 登录失败：看 `/captchaImage`、`/login`、Cookie `Admin-Token`、`src/store/modules/user.js`。
- 登录后白屏：看 `/getInfo`、`/getRouters`、后端 component 路径、浏览器控制台动态 import 错误。
- 菜单有但页面 404：检查后端菜单 path/component 与 `src/views` 文件是否对应。
- 医院数据不对：先确认当前 token 是否选择了正确医院，再看顶部栏 `/medical/hospital/current`。
- 收费明细无法新增：确认路由 query 是否带 `visitId`。
- 药品库存不能改：确认是否拥有 `medical:medicine:stock` 权限。
- 字典不显示：确认后端字典类型是否存在，例如 `medical_payment_type`。
