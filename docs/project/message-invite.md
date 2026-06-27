# 系统消息与邀请审核

## 需求记录

2026-06-27 任务 5 前端开发覆盖：

- 系统消息发送页面：`src/views/medical/systemMessage/index.vue`
- 邀请审核页面：`src/views/medical/hospital/inviteAudit/index.vue`
- 顶部消息入口：`src/layout/components/Navbar.vue`
- API 封装：`src/api/medical/systemMessage.js`、`src/api/medical/hospitalInviteApply.js`

对应后端需求主分支：`codex/medical-requirements-20260627`。任务分支约定：`codex/medical-requirements-20260627-message-invite`。

## 前端入口与菜单

业务菜单由后端 `/getRouters` 下发，新增菜单时后端 `component` 应分别指向：

- 系统消息发送：`medical/systemMessage/index`
- 邀请审核：`medical/hospital/inviteAudit/index`

页面组件 `name` 分别为 `MedicalSystemMessage` 和 `MedicalHospitalInviteAudit`，避免 tagsView/keep-alive 名称冲突。

## API 约定

系统消息：

- `GET /medical/system/message/list`
- `GET /medical/system/message/{messageId}`
- `POST /medical/system/message`
- `POST /medical/system/message/send`
- `PUT /medical/system/message/{messageId}/send`

邀请审核：

- `GET /medical/hospital/invite/apply/list`
- `GET /medical/hospital/invite/apply/{applyId}`
- `PUT /medical/hospital/invite/apply/{applyId}/approve`
- `PUT /medical/hospital/invite/apply/{applyId}/reject`

接口返回列表兼容 `rows` 与 `data`，用于适配若依分页结构和 options 风格差异。

## 字段口径

- 系统消息目标类型：`PHONE`、`HOSPITAL`、`UID`、`HOSPITAL_USER`。
- 系统消息状态：`DRAFT`、`SENT`、`FAILED`。
- 邀请审核状态：`PENDING`、`APPROVED`、`REJECTED`。
- 邀请审核通过弹窗提交 `roleIds`、`deptId`、`postId`；拒绝弹窗提交 `rejectReason`。
- 申请人、邀请人、审核人字段均以后端稳定 ID 保存，前端只展示后端关联出的名称。

## 特殊处理

- 右上角消息入口继续复用 `/medical/hospital/notification/mine` 和已读接口，不另建前端消息池。
- 顶部消息入口现在对当前医院用户展示，系统超管仍不请求医院上下文消息。
- 系统消息和医院消息统一展示，通过 `businessType === 'SYSTEM_MESSAGE'` 标记系统消息，其他类型按医院消息展示。
- 本次未运行 `npm run build` 或 `npm run dev`，遵循任务要求不启动和不构建。

## 后续联调注意

- 若后端最终接口路径调整，优先只改 `src/api/medical/systemMessage.js` 和 `src/api/medical/hospitalInviteApply.js`。
- 若后端通过新增系统消息后再单独发送，应确保 `POST /medical/system/message/send` 支持直接创建并发送，或前端改为先创建再调用按 ID 发送。
- 按钮权限当前使用 `medical:systemMessage:add`、`medical:systemMessage:send`、`medical:inviteApply:audit`，后端菜单权限需要保持一致。
