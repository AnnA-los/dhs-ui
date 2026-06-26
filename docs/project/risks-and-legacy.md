# 主要风险与历史特殊处理

本文件记录接手时最容易误改导致业务崩溃的点。

## 高风险：当前医院上下文和 token

医疗业务依赖当前医院上下文。普通登录后可能不是最终可用 token：

1. `/login` 返回 token。
2. 如果 `needSelectHospital` 为真，必须调用 `/medical/hospital/select-login/{hospitalUserId}`。
3. 第二个接口返回的新 token 才代表用户选择的医院上下文。

顶部切换医院成功后执行 `window.location.reload()`。不要轻易改成局部刷新。否则可能出现：

- Vuex 中用户、权限、菜单仍是旧医院。
- keep-alive 页面继续带着旧查询条件。
- 字典、列表、远程 options 显示旧医院数据。
- 后续收费、病历、库存操作落到错误医院。

## 高风险：菜单路由由后端下发

业务菜单不是在 `src/router/index.js` 中完整定义。`/getRouters` 返回的 component 字符串会映射到 `src/views/**`。

风险：

- 改前端文件路径但不改后端菜单，会出现白屏或 404。
- 改页面 `name` 会影响 keep-alive 和 tagsView 缓存。
- 删除 `Layout`、`ParentView`、`InnerLink` 特殊映射会导致后端菜单无法加载。
- `/medical/visitUsage` 是前端隐藏路由，不能只看后端菜单判断它无用。

## 高风险：病历、收费明细、收费单、库存联动

核心链路：

预约 -> 接诊病历 -> 收费明细 -> 收费单 -> 收款/退款 -> 报表/库存。

具体风险：

- 病历提交后由后端生成收费单。前端提示已明确该规则。
- 收费明细选择药品/耗材时，前端根据剩余数量限制数量，但库存真实扣减和并发一致性必须以后端为准。
- 编辑收费明细时，前端把可用库存扩展为 `availableQuantity + usedQuantity`，用于保留原明细数量。不要改成只用当前库存，否则编辑老明细可能无法保存。
- 收费单金额前端会计算实收，但状态自动计算、汇总、报表统计必须以后端为准。
- 折扣比例语义是“实际收取比例”，不是“减免比例”。`80` 表示 8 折，实收为总额的 80%。

## 高风险：医院 owner/super admin

医院用户列表里 owner/super admin 禁止修改、分配角色、删除。个人中心允许超级管理员按手机号转让 owner，成功后强制登出。

不要绕过这些限制：

- owner 被删或角色被降级会导致医院无人可管理。
- owner 换绑后旧用户权限应立即失效，所以前端强制登出。
- `isAdmin === '1'` 和 `roleLevel === 0` 都被视为超级管理员迹象。

## 中高风险：系统权限与医院权限是两套概念

`roles`、`permissions` 来自若依系统权限，用于菜单、按钮、系统功能。医院角色、医院用户层级用于当前医院内部业务。

不要把两者混用。例如：

- `roles.includes('admin')` 或 `permissions.includes('*:*:*')` 是系统超管判断。
- `currentHospitalUser.isAdmin === '1'` 是当前医院超级管理员判断。
- 医院通知只对非系统工具用户且当前医院管理员展示。

## 中高风险：日期默认当前月不是普通默认值

预约、病历、收费、报表等页面默认使用当前自然月，并且日期范围清空后会恢复当前月：

- `getCurrentMonthRange()`
- `getCurrentMonthTimeRange()`
- `restoreCurrentMonthRange()`

这看起来不像常规交互，但它降低了误查全量数据和后端压力。改成允许空范围前，需要确认后端分页、索引、权限隔离和业务方预期。

## 中高风险：请求拦截器里的重复提交

`src/utils/request.js` 对 POST/PUT 默认做 1 秒重复提交拦截。登录接口显式设置 `repeatSubmit: false`。

风险：

- 大文件/大 payload 超过 5MB 会跳过重复提交校验。
- 同 URL、同数据、1 秒内的合法连续操作可能被拦截。
- 新增接口如果确实需要快速重复提交，必须显式评估后设置 `headers.repeatSubmit = false`。

## 中风险：GET 参数手动拼接

request 拦截器会把 GET `params` 转成 query string 并清空 `config.params`。嵌套对象会被转成 `params[beginTime]` 这种格式。

风险：

- 后端参数绑定依赖若依风格的 `params[xxx]`。
- 不要在业务 API 中自己再拼复杂 query，容易双重编码。
- 传数组、深层对象时当前工具不一定按预期处理。

## 中风险：字典和 options 的返回结构不一致

代码中常见写法：

- `response.data || []`
- `response.rows || []`
- `response.data || response.rows || []`

说明后端不同接口返回结构不完全统一。新增页面时不要假设所有 options 都是同一种格式，最好沿用同类页面的处理。

## 中风险：病历/预约类型共用 VISIT

预约类型和病历类型都使用 `typeCategory: 'VISIT'`。这可能是业务上的统一“就诊/病历类型”，不要随意拆成两个 category，除非后端和历史数据同步迁移。

## 中风险：患者隐私字段不能回传

患者编辑时执行：

```js
delete this.form.privacyAuth
```

这说明后端返回里有表单不应提交的字段。不要在重构表单时把它保留下来直接 PUT。

## 中风险：库存剩余数量权限

药品编辑中，只有拥有 `medical:medicine:stock` 权限时才能编辑 `remainingQuantity`。无权限或新增时会删除该字段。

风险：

- 如果删除这个保护，普通资料编辑可能误改库存。
- 如果所有更新都带 `remainingQuantity`，后端可能把旧值覆盖为错误值。

## 中风险：CSS 使用 `:has`

布局文件中使用了 CSS `:has()`：

- `src/layout/index.vue`
- `src/layout/components/AppMain.vue`

现代浏览器支持较好，但旧浏览器兼容性仍需注意。若需要兼容老环境，不能只改业务页，要评估整体布局滚动。

## 中风险：README/注释来源于若依模板

仓库保留大量若依风格代码和注释。当前文件编码是 UTF-8；如果 PowerShell 默认输出出现乱码，使用 `Get-Content -Encoding UTF8` 查看。

不要因为命令行乱码误判文件损坏。

## 中风险：前端无测试体系

`package.json` 中没有 test/lint 脚本。验证主要依赖：

- `npm run build:prod`
- 关键业务手工联调
- 浏览器页面操作

修改核心链路时一定要手工覆盖登录、医院选择/切换、菜单加载、预约转病历、收费明细、收费单保存。

## 低中风险：Vue2 与依赖版本较老

项目仍是 Vue2 + Vue CLI 4。依赖升级风险较高：

- Element UI 已是 Vue2 生态。
- `node-sass` 未使用，但 Sass 版本固定较旧。
- `axios`、`quill`、`highlight.js` 等升级可能带来 breaking changes。

除非专门做升级任务，不要在业务改动中顺手升级依赖。

