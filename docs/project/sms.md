# 短信配置、模板、场景和发送日志

## 需求背景

2026-06-27 医疗需求任务 6 要求先落短信底座前端页面，用于后续登录注册验证码、邀请审核通过/拒绝通知等场景。对应 `dhs-core` 需求主分支为 `codex/medical-requirements-20260627`，任务分支约定为 `codex/medical-requirements-20260627-sms`。

## 前端实现

- API 封装：`src/api/system/sms.js`
- 短信渠道：`src/views/system/sms/channel/index.vue`
- 短信模板：`src/views/system/sms/template/index.vue`
- 场景关联：`src/views/system/sms/scene/index.vue`
- 发送日志：`src/views/system/sms/log/index.vue`

后端菜单 component 建议保持：

- `system/sms/channel/index`
- `system/sms/template/index`
- `system/sms/scene/index`
- `system/sms/log/index`

## 关键交互

- 编辑短信渠道时，渠道编码和渠道名称置灰不可修改。
- 编辑短信模板时，模板编码和模板名称置灰不可修改。
- 短信模板页的渠道下拉展示渠道名称，表单提交渠道编码。
- 场景关联页的模板下拉展示模板名称，表单提交模板编码。
- 发送日志列表和错误详情弹窗在前端再次脱敏手机号、验证码、密钥、token 等高风险内容。

## 联调约定

- 当前前端按系统级短信配置封装接口：`/system/sms/channel`、`/system/sms/template`、`/system/sms/scene-template`、`/system/sms/send-log`。
- 场景编码当前约定：`YZM`、`INVITE_APPROVED`、`INVITE_REJECTED`。
- 渠道和模板列表读取 `rows`，下拉读取同一列表接口的启用数据；如果后端后续新增独立 options 接口，可再小范围替换。

## 风险和限制

- 后端已在 `dhs-core` 需求主分支补齐 `SysSmsController`，接口路径与 `src/api/system/sms.js` 保持一致。
- 短信渠道参数可能包含密钥，页面只提供配置入口，不应在文档、日志和调试输出中记录真实密钥。
- 后端仍需负责删除/禁用拦截：存在启用模板或场景关联时禁止删除或禁用渠道/模板。

## 验证记录

- 已执行 `git diff --check`，未发现空白错误。
- 未执行 `npm run build` 或 `npm run dev`，遵循本任务要求。
- 项目没有 `test`/`lint` 脚本，本地也未安装 `vue-template-compiler`，本次未做 SFC 编译验证。
