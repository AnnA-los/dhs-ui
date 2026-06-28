# 系统消息与邀请审核

## 需求记录

2026-06-27 任务 5 前端开发覆盖：

- 系统消息发送页面：`src/views/system/message/index.vue`
- 邀请审核页面：`src/views/medical/hospital/inviteAudit/index.vue`
- 顶部消息入口：`src/layout/components/Navbar.vue`
- API 封装：`src/api/system/message.js`、`src/api/medical/hospitalInviteApply.js`

对应后端需求主分支：`codex/medical-requirements-20260627`。任务分支约定：`codex/medical-requirements-20260627-message-invite`。

## 前端入口与菜单

菜单由后端 `/getRouters` 下发，新增菜单时后端 `component` 应分别指向：

- 系统消息发送：`system/message/index`，属于系统后台“系统管理”，不属于医院业务“业务管理”
- 邀请审核：`medical/hospital/inviteAudit/index`

页面组件 `name` 分别为 `SystemMessage` 和 `MedicalHospitalInviteAudit`，避免 tagsView/keep-alive 名称冲突。

## API 约定

系统消息：

- `GET /system/message/list`
- `POST /system/message/dispatch`

邀请审核：

- `GET /medical/hospital/invite/audit/list`
- `PUT /medical/hospital/invite/audit/{applyId}/approve`
- `PUT /medical/hospital/invite/audit/{applyId}/reject`

接口返回列表兼容 `rows` 与 `data`，用于适配若依分页结构和 options 风格差异。

## 字段口径

- 系统消息目标类型：`PHONE`、`HOSPITAL`、`UID`、`HOSPITAL_USER`。
- 系统消息状态：`DRAFT`、`SENT`、`FAILED`。
- 邀请审核状态：`PENDING`、`APPROVED`、`REJECTED`。
- 邀请审核通过弹窗提交 `roleIds`、`deptId`、`postId`；拒绝弹窗提交 `rejectReason`。
- 申请人、邀请人、审核人字段均以后端稳定 ID 保存，前端只展示后端关联出的名称。
- 邀请审核列表不展示部门、岗位、角色；这些字段只在审核通过弹窗中选择。审核通过和审核拒绝列表需要展示审核人和审核时间，审核拒绝列表额外展示拒绝原因。

## 特殊处理

- 右上角消息入口继续复用 `/medical/hospital/notification/mine` 和已读接口，不另建前端消息池。
- 顶部消息入口现在对当前医院用户展示，系统超管仍不请求医院上下文消息。
- 系统消息和医院消息统一展示，通过 `businessType === 'SYSTEM_MESSAGE'` 标记系统消息，其他类型按医院消息展示。
- 本次未运行 `npm run build` 或 `npm run dev`，遵循任务要求不启动和不构建。

## 后续联调注意

- 若后端最终接口路径调整，优先只改 `src/api/system/message.js` 和 `src/api/medical/hospitalInviteApply.js`。
- 系统消息按后端已实现能力收敛为“创建并发送”，不在前端保留草稿和重发入口。
- 按钮权限当前使用 `system:message:send`、`medical:hospital:invite:audit`，后端菜单权限需要保持一致。
