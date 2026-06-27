# 核心业务梳理

## 业务域总览

医疗业务集中在：

- 页面：`src/views/medical`
- API：`src/api/medical`

主要域：

- 医院与组织：`hospital`、`hospital/dept`、`hospital/post`、`hospital/user`、`hospital/role`、`hospital/invite`、`hospital/notification`
- 患者：`patient`
- 预约：`appointment`
- 接诊病历：`visit`
- 收费明细：`visitUsage`
- 收费单：`charge`
- 药品/耗材/项目/加工定制：`medicine`、`consumable`、`project`、`customWork`
- 排班/随访：`schedule`、`followup`
- 报表/日志：`report`、`businessLog`
- 其他资料：`equipment`、`material`

## 多医院上下文

这是项目最核心的数据隔离前提。

用户可能属于多个医院。普通登录成功后，如果后端返回 `needSelectHospital`，前端不会直接进入首页，而是弹出医院选择。选择医院后，调用 `/medical/hospital/select-login/{hospitalUserId}`，后端返回与当前医院绑定的新 token。

顶部栏医院切换调用 `/medical/hospital/switch/{hospitalUserId}`，成功后执行 `window.location.reload()`。这个刷新不是多余的，它用于清空当前页面、菜单、缓存和接口状态，避免旧医院上下文残留。

开发任何医疗业务功能时都应默认：后端根据 token 中的当前医院做数据隔离，前端不要自行传 `hospitalId` 绕过上下文。

## 注册与加入医院

注册页 `src/views/register.vue` 历史基线曾同时开放手机方式和邮箱方式；当前 2026-06-27 需求要求收敛为只保留手机号注册，移除邮箱注册入口和提交字段。

- 无邀请码：必须填写医院/诊所名称，注册后创建或绑定医院主体。
- 有邀请码：前端会清空 `hospitalName`、`hospitalType`，注册逻辑交给后端按邀请码加入当前医院。

个人中心 `src/views/system/user/profile/index.vue` 中：

- 医院超级管理员可编辑医院基础信息。
- 可查看/复制当前医院邀请码。
- 可通过手机号转让医院超级管理员权限，成功后强制登出。

## 医院组织与权限

医院内组织模块包括：

- 部门：`src/views/medical/hospital/dept/index.vue`
- 岗位：`src/views/medical/hospital/post/index.vue`
- 医院角色：`src/views/medical/hospital/role/index.vue`
- 医院用户：`src/views/medical/hospital/user/index.vue`

医院用户的几个特殊点：

- 历史基线曾允许手机号/邮箱二选一；当前 2026-06-27 需求要求手机号必填，邮箱不展示、不提交并由后端强制清空。
- 修改已有医院用户时不展示密码字段。
- 医院 owner/super admin 不允许在用户列表中修改或删除；普通医院用户的角色在修改弹窗里的角色字段维护。如代码中存在独立“角色/分配医院角色”按钮或弹窗，属于历史重复入口，本需求应收敛移除。
- 角色层级约定：`0` 超级管理员、`10` 合伙人、`20` 管理员、`30` 员工。
- 默认业务角色是 `hospital_id=0` 的超级管理员、合伙人、管理员、员工。医院未替换默认角色时直接展示和使用默认角色；修改默认角色权限时，后端会无感复制成当前医院自有角色并用 `default_role_id` 记录来源，同时迁移当前医院绑定成员；停用或删除默认角色前必须无成员，有成员时拒绝。
- 角色管理列表不展示默认列；修改角色弹窗中角色名称和角色层级置灰不可修改。

注意：这里的医院角色/层级与若依系统角色不是一回事。若依系统角色影响菜单和系统权限，医院角色影响医院内业务能力。

## 患者

患者页面：`src/views/medical/patient/index.vue`。

字段包括患者姓名、性别、手机号、出生日期、证件号、来源渠道、过敏史、备注。

编辑患者时前端会删除 `privacyAuth` 字段再提交，说明后端返回中存在不应由该表单回传的敏感/授权字段。不要随意恢复该字段提交。

## 预约

预约页面：`src/views/medical/appointment/index.vue`。

预约状态：

- `1` 已预约
- `2` 已签到
- `4` 已完成
- `5` 已取消
- `6` 爽约

关键业务规则：

- 默认查询当前自然月。
- 清空日期范围后会自动恢复当前自然月。
- 新增/编辑预约必须选择部门后才能筛选医生。
- 医生下拉使用 `/medical/hospital/user/doctorOptions`，编辑时会合并当前医生，避免历史医生不在当前筛选结果中导致回显丢失。
- 状态为 `5` 已取消时必须填写取消原因。
- 只有状态为 `2` 已签到的预约在列表中出现“新增病历”入口。
- “新增病历”会在后端菜单中查找标题为“接诊病历”的真实路径；找不到时回退到 `/medicalPatient/visit`。这是为了兼容后端菜单路径变动。

预约类型使用通用医疗类型接口，`typeCategory` 为 `VISIT`。

## 接诊病历

病历页面：`src/views/medical/visit/index.vue`。

病历状态：

- `0` 草稿
- `1` 已提交

关键业务规则：

- 默认查询当前自然月。
- 清空接诊时间范围后会自动恢复当前自然月。
- 新增病历可选择已有患者，也可输入新患者；如果不是已有患者，则手机号必填的约束主要依赖页面提示和后端校验。
- 编辑病历时患者、医生、病历类型等关键字段被禁用，避免已有关联链路被改乱。
- 病历类型同样使用 `typeCategory = VISIT`。
- 表单提示明确写着：提交后会生成一笔收费单，可在收费管理查看。
- 病历详情中可以查看病历纸张式详情和费用单据。
- 从预约进入病历时，会通过路由 query `appointmentId` 自动打开新增病历弹窗并带入预约信息。

病历与收费联动是核心链路。不要把病历提交、收费单生成、收费明细入口拆散处理。

## 收费明细

收费明细页：`src/views/medical/visitUsage/index.vue`。

该页是隐藏路由 `/medical/visitUsage`，必须带 query `visitId`。如果没有 `visitId`，页面不会查询数据，新增时会提示“请先从接诊病历进入本页面”。

明细类型：

- `MEDICINE` 药品
- `CONSUMABLE` 耗材
- `PROJECT` 项目
- `CUSTOM` 加工定制
- `OTHER` 其他

关键规则：

- 药品、耗材、项目、加工定制都需要从对应资料中选择；其他类型可手填名称。
- 药品和耗材会读取剩余数量，数量输入的最大值受 `currentAvailable` 限制。
- 编辑药品/耗材明细时，`currentAvailable = availableQuantity + usedQuantity`，用于允许保存原明细数量。
- 项目和加工定制只筛选 `saleStatus: '0'` 的可售数据。
- 明细总价由前端按 `unitPrice * usedQuantity` 计算，但最终库存扣减、费用单汇总应以后端为准。

## 收费单

收费单页面：`src/views/medical/charge/index.vue`。

收费状态：

- `0` 待收费
- `1` 部分收费
- `2` 已收费
- `3` 已退款
- `4` 已作废
- `5` 部分退款

关键规则：

- 默认查询当前自然月。
- 清空日期范围后会自动恢复当前自然月。
- 支付类型来自字典 `medical_payment_type`，以逗号分隔字符串保存。
- 非作废状态下，只要已收金额或退款金额大于 0，就必须选择支付类型。
- 折扣比例和折扣金额不能同时大于 0。
- 折扣比例必须是 0 到 100 的整数。
- 这里的折扣比例含义是“按多少比例收取”，例如 `80` 显示为 `8折`，实际金额为 `totalAmount * 80 / 100`。
- 除作废外，状态提示写明由已收、实收和退款金额自动计算，前端不应强行暴露状态自由编辑。
- 退款金额大于已收金额时，前端只做二次确认，不拦死。

## 药品、耗材、项目、加工定制

药品页面：`src/views/medical/medicine/index.vue`。

药品/耗材使用共享表单模式，`medicine/sharedAssetForm.vue` 展示了库存类资料的共同字段：

- 类型
- 采购时间
- 采购批次号
- 采购数量
- 剩余数量
- 单价
- 售价，药品特有
- 告警阈值

关键规则：

- `remainingQuantity` 只有拥有 `medical:medicine:stock` 权限且编辑已有药品时才可见。
- 无库存权限或新增药品时，提交前会删除 `remainingQuantity`，避免普通编辑误改库存。
- 类型是医疗通用类型，药品使用 `typeCategory = MEDICINE`。

项目、耗材、加工定制分别通过各自 API 提供列表和 options，收费明细会消费这些 options。

## 类型管理

通用类型接口：`src/api/medical/type.js`。

组件：`src/views/medical/components/TypeManageDialog.vue`。

目前类型弹窗主要用于删除已有类型：

- 弹窗打开时加载 `medicalTypeOptions({ typeCategory })`。
- 点关闭标签只是加入待删除列表。
- 保存时批量调用 `delMedicalType(typeId)`。
- 已被使用的类型删除由后端拒绝。

页面中也允许在 autocomplete 中输入新类型文本，此时 `typeId` 置空，是否自动创建类型取决于后端保存逻辑。

## 报表

报表页：`src/views/medical/report/index.vue`。

统计内容：

- 患者数
- 预约数
- 接诊数
- 收费单数
- 实收金额
- 库存预警数
- 采购成本、收入、利润
- 药品/耗材/项目使用统计

报表支持年、月、日、小时粒度，图表支持柱状图、折线图、饼图。饼图还区分按时间和按分类。默认日期范围是当前自然月。

