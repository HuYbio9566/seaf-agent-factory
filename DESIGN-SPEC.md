# SEAF 智能体工厂设计规范

> 版本：1.0  
> 适用范围：首页、智能体管理、智能体模板、知识库、模型管理、Skill 管理、MCP 与连接器、Widget、提示词模板。  
> 用途：作为视觉设计、前端实现和验收的唯一规则源。

## 1. 设计原则

1. **稳定优先**：窗口拉伸时，卡片宽度、列数、间距和信息位置必须可预期。
2. **一致优先**：同类页面共用一套容器、工具栏、卡片和状态规则。
3. **信息优先**：界面保持安静、清晰、高可扫读性，装饰不干扰业务内容。
4. **容器驱动**：响应式判断以主内容区的实际宽度为准，不以浏览器 viewport 为准。
5. **不因数量变形**：卡片数量只影响最后一行占用几个网格轨道，不影响卡片宽度。

## 2. 页面框架

### 2.1 基础布局

- 侧边栏保持固定宽度，主内容区使用剩余宽度。
- 主内容区页面内边距：桌面端 `20px`，小屏可降为 `16px`。
- 标准资源页内容最大宽度：`2064px`，计算为 `5 × 400 + 4 × 16`。
- Widget 列表最大宽度：`1232px`，计算为 `3 × 400 + 2 × 16`。
- 超过最大宽度后内容整体居中，左右留白必须对称。

### 2.2 页面垂直结构

```text
页面标题
↓ 4px
一级 Tab（存在时）
↓ 16px
搜索 / 筛选 / 主操作工具栏
↓ 16px
分类标签行（存在时）
↓ 16px
卡片或表格内容
```

- 一级 Tab 包括：知识数据 / 知识问答、MCP 广场 / 我的 MCP / 连接器、Widget 广场 / 我的 Widget、内置模板 / 自定义模板。
- 分类标签行不显示“模板分类”、“Widget 分类”等重复标题。

## 3. 设计 Token

### 3.1 颜色

| 语义 | Token | 浅色模式 | 用途 |
|---|---|---|---|
| 页面背景 | `--background` | `#F5F8FC` | 最底层大背景 |
| 卡片背景 | `--card` | `#FFFFFF` | 卡片、弹窗、面板 |
| 主文字 | `--foreground` | `oklch(26.23% 0.0254 258.34)` | 标题和主信息 |
| 次文字 | `--muted-foreground` | `oklch(54.28% 0.0326 261.39)` | 辅助信息 |
| 占位文字 | `--tertiary-foreground` | `#9EA7B8` | Placeholder |
| 主色 | `--primary` | `oklch(57.30% 0.2351 260.11)` | 主按钮、选中、链接 |
| 主色浅底 | `--brand-blue-50` | `#E8F5FF` | 选中标签、官方角标 |
| 弱分割线 | `--border` | `#EDF1F5` | 分割线、卡片描边 |
| 表单描边 | `--input` | `#E1E7ED` | 输入框、下拉框 |
| 成功 | `--brand-green-500` | `#00B42A` | 成功、可用 |
| 警告 | `--brand-gold-600` | `#CC9213` | 自建、待处理 |
| 错误 | `--destructive` | `oklch(64.19% 0.2182 25.88)` | 危险操作、错误 |

颜色使用规则：

- 正文与背景对比度至少 `4.5:1`，大字至少 `3:1`。
- 不能只用颜色表达状态，同时使用文字或图标。
- 资源图标的前景色必须与浅色背景同色系，例如浅绿背景配绿色图标。
- MCP 广场的“官方”使用主题蓝，“自建”使用金黄色；我的 MCP 不显示角标。

### 3.2 字体

字体栈：

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "PingFang SC", "Microsoft YaHei", sans-serif;
```

| 层级 | 字号 / 行高 / 字重 | 用途 |
|---|---|---|
| 页面标题 | `20px / 28px / 600` | 每个主页面的唯一 H1 |
| 区块标题 | `16px / 24px / 600` | 页面内二级标题 |
| 卡片标题 | `14px / 22px / 600` | 资源名称 |
| 正文 | `14px / 22px / 400` | 描述和表格主文字 |
| 辅助文字 | `12px / 20px / 400` | 时间、所有者、统计 |
| 标签 | `12px / 20px / 400–500` | 类型、状态 |

文字不随 viewport 等比缩放，不使用 `vw` 设定字号，字间距保持 `0`。

### 3.3 间距

所有布局使用 `4px` 基准网格。

| Token | 值 | 典型用途 |
|---|---:|---|
| `--space-1` | `4px` | 标题与一级 Tab |
| `--space-2` | `8px` | 图标与文字、标签之间 |
| `--space-3` | `12px` | 工具栏折行行距、描述与分割线 |
| `--space-4` | `16px` | 卡片间距、工具栏与标签行 |
| `--space-5` | `20px` | 页面内边距、卡片内边距 |
| `--space-6` | `24px` | 大区块之间 |
| `--space-8` | `32px` | 页面级分组 |

禁止在同一卡片网格中混用 `12px`、`16px`、`20px` 作为卡片间距。资源卡统一为 `16px`。

### 3.4 圆角、描边和阴影

- 基础控件圆角：`8px`。
- 资源卡片圆角：`12px`。
- 标签可使用全圆角，但不用于普通按钮。
- 卡片默认描边：`1px solid var(--border)`。
- 卡片默认阴影：`0 1px 2px rgba(15, 23, 42, 0.03)`。
- 悬停时使用主色描边和轻阴影，不改变卡片尺寸。
- 交互状态不得通过增加 border 宽度造成布局抖动。

## 4. 基础组件

### 4.1 按钮

| 尺寸 | 高度 | 水平内边距 | 用途 |
|---|---:|---:|---|
| 小 | `24px` | `8px` | 卡片内紧凑操作 |
| 默认 | `32px` | `12px` | 工具栏和常规操作 |
| 大 | `40px` | `16px` | 弹窗主操作、强调入口 |

- 新建、添加、导入等命令使用图标 + 文字。
- 纯图标按钮必须提供 `aria-label` 和 hover tooltip。
- 同一工具栏只保留一个主按钮。
- 按钮的 hover、active、focus-visible、disabled 状态必须完整。

### 4.2 搜索与筛选

- 搜索框默认宽度：`240px`，可伸展，最小宽度 `200px`。
- 下拉筛选默认宽度：`160px`，最小宽度 `140px`。
- 输入框和下拉框统一高度 `32px`。
- 搜索、筛选和操作按钮在同一行时垂直居中对齐。

### 4.3 Tab

- 一级 Tab 使用线性样式，放在页面标题下方 `4px`。
- 选中项使用主色文字和底部指示线。
- 不同 Tab 下的内容宽度、网格和工具栏对齐起点必须一致。

### 4.4 分类标签

- 高度：`32px`。
- 水平内边距：`12px`。
- 标签间距：`8px`。
- 分类标签必须放在搜索工具栏的下一行，上间距 `16px`。
- 宽度不足时自然折行，折行行距 `8px`。
- 选中项使用浅蓝背景和主色文字；未选项不使用强描边。

## 5. 卡片规范

### 5.1 通用结构

```text
角标（可选，卡片右上角）
图标 / 头像 + 标题 + 类型信息
描述（固定两行高度）
业务标签 / 状态
分割线
所有者 + 时间                       统计 / 操作
```

- 卡片内边距统一为 `20px`；固定高度的 MCP 卡片底部内边距为 `16px`。
- 卡片内容使用 `min-width: 0`，标题在可用空间内截断，不得被右上角角标额外挤压。
- 右上角角标使用绝对定位，不参与标题行的 flex 宽度计算。
- 所有卡片内的底部信息位置对齐，不因描述长度变化。

### 5.2 描述文字

- MCP 描述：`font-size: 12px; line-height: 20px; height: 40px;`。
- 智能体描述：`font-size: 14px; line-height: 24px; height: 48px;`。
- 最多显示两行，超出使用多行省略。
- 内容不足两行时仍保留两行高度，禁止使用仅限制最小高度的不稳定实现。
- MCP 描述与下方分割线保持 `12px` 间距。

```css
.line-clamp-2-fixed {
  display: -webkit-box;
  overflow: hidden;
  height: 40px;
  line-height: 20px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

### 5.3 MCP 卡片

- 固定高度：`184px`。
- 描述固定两行。
- 底部信息顺序：“所有者 · 时间”在左，“调用数量”在最右。
- MCP 广场显示“官方 / 自建”角标，我的 MCP 不显示。
- 标题可用宽度应从左侧图标后一直延伸到卡片右内边距，角标通过顶部预留区避让，不改变标题容器宽度。

### 5.4 Widget 卡片

- Widget 广场和我的 Widget 必须共用同一套宽度、列数和间距规则。
- 预览区高度：`224px`，预览内容不得改变卡片宽度。
- 分类信息和更新时间在同一行，中间使用 `1px` 分割线，分类不使用描边和底色。
- 卡片比标准资源卡更大，整页最多显示 3 列。

## 6. 响应式卡片网格

### 6.1 禁止规则

核心资源卡片禁止使用以下规则决定列数：

```css
/* 禁止：它会因卡片数量和临界宽度自动拉伸。 */
grid-template-columns: repeat(auto-fit, minmax(248px, 1fr));
```

`auto-fit` 会折叠未使用轨道，使最后一行或数量较少的模块自动变宽。产品必须使用明确的固定列数。

### 6.2 标准资源卡

适用于：智能体管理、智能体模板、MCP 广场、我的 MCP。

- 卡片最小目标宽度：`248px`。
- 卡片最大宽度：`400px`。
- 卡片水平和垂直间距：`16px`。
- 最大列数：5。

| 资源内容容器宽度 | 列数 | 说明 |
|---:|---:|---|
| `< 512px` | 1 | 手机和极窄面板 |
| `512–775px` | 2 | 窄面板 |
| `776–1039px` | 3 | 小屏桌面端 |
| `1040–1303px` | 4 | 常规桌面端 |
| `≥ 1304px` | 5 | 大屏桌面端 |

断点计算公式：

```text
n 列的最小容器宽度 = n × 248px + (n - 1) × 16px
```

注意：当容器小于 `248px` 时，单列卡片允许缩小至可用宽度，不产生水平滚动。

### 6.3 Widget 卡片

适用于：Widget 广场、我的 Widget。

- 卡片最小目标宽度：`320px`。
- 卡片最大宽度：`400px`。
- 卡片间距：`16px`。
- 最大列数：3，禁止出现第 4 列。

| Widget 内容容器宽度 | 列数 |
|---:|---:|
| `< 656px` | 1 |
| `656–991px` | 2 |
| `≥ 992px` | 3 |

断点计算公式：

```text
n 列的最小容器宽度 = n × 320px + (n - 1) × 16px
```

### 6.4 参考实现

容器查询不能查询元素自身，因此必须使用外层 `.resource-grid-shell` 和内层 `.resource-grid`。

```html
<div class="resource-grid-shell resource-grid-shell--standard">
  <section class="resource-grid resource-grid--standard">…</section>
</div>
```

```css
:root {
  --resource-card-gap: 16px;
  --resource-card-min: 248px;
  --resource-card-max: 400px;
  --widget-card-min: 320px;
}

.resource-grid-shell {
  container-type: inline-size;
  width: 100%;
  margin-inline: auto;
}

.resource-grid-shell--standard {
  max-width: 2064px;
}

.resource-grid-shell--widget {
  max-width: 1232px;
}

.resource-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--resource-card-gap);
  width: 100%;
}

.resource-grid > * {
  width: 100%;
  min-width: 0;
  max-width: none;
}

@container (min-width: 512px) {
  .resource-grid--standard {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (min-width: 776px) {
  .resource-grid--standard {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@container (min-width: 1040px) {
  .resource-grid--standard {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@container (min-width: 1304px) {
  .resource-grid--standard {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@container (min-width: 656px) {
  .resource-grid--widget {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@container (min-width: 992px) {
  .resource-grid--widget {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
```

实现结果必须满足：

- 同一容器宽度下，所有标准资源页列数一致。
- 同一行的卡片等宽，最后一行也使用相同轨道宽度。
- 列数只在上述断点变化，不因卡片数量变化。
- 最大宽度之外仅出现左右对称留白，不允许只在右侧留出异常空白。

## 7. 工具栏适配规则

### 7.1 结构

```text
左侧组：[搜索] [筛选 1] [筛选 2]    自适应空间    右侧组：[导入] [新建]
```

- 左侧搜索和筛选的水平间距：`8px`。
- 右侧操作按钮间距：`8px`。
- 左右组之间至少 `16px`。
- 折行后的垂直行距：`12px`。
- 右侧操作组必须作为整体折行，禁止多个按钮分散到不同行。

### 7.2 容器断点

| 工具栏容器宽度 | 行为 |
|---:|---|
| `≥ 760px` | 左右组同行，右侧组右对齐 |
| `560–759px` | 右侧操作组整体换到第二行并右对齐 |
| `< 560px` | 搜索框独占一行；筛选和操作在后续行中分组布局 |

### 7.3 参考实现

```css
.filter-shell {
  container-type: inline-size;
  width: 100%;
}

.filter-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px 16px;
}

.filter-toolbar__left,
.filter-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-toolbar__right {
  justify-self: end;
  white-space: nowrap;
}

.filter-toolbar__search {
  width: 240px;
  min-width: 200px;
}

@container (max-width: 759px) {
  .filter-toolbar {
    grid-template-columns: minmax(0, 1fr);
  }

  .filter-toolbar__right {
    grid-row: 2;
    justify-self: end;
  }
}

@container (max-width: 559px) {
  .filter-toolbar__left {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .filter-toolbar__search {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
  }

  .filter-toolbar__left .select-shell {
    width: 100%;
    min-width: 0;
  }
}
```

## 8. 表格适配

- `≥ 960px`：显示完整列，操作列右对齐。
- `720–959px`：优先隐藏低优先级列，例如长描述、次要统计；不压缩主标题和状态。
- `< 720px`：表格容器允许水平滚动，并为前 1–2 列提供粘性定位；如移动端操作频繁，可转为单列列表，但同一页不同时提供“卡片 / 列表”模式切换。
- 表格最小可触高度 `40px`，操作菜单不被文本截断。
- 使用字段优先级而不是等比缩小整张表格。

## 9. 状态反馈

### 9.1 空状态

- 明确说明当前为何无内容，例如“暂无符合条件的智能体”。
- 当用户有创建权限时，提供一个直接主操作，例如“新建智能体”。
- 筛选造成的空状态优先提供“清除筛选”，不误导用户创建重复资源。

### 9.2 加载状态

- 首次加载使用骨架卡，骨架的列数和高度与真实卡片一致。
- 筛选刷新优先保留现有布局，用局部加载反馈，不整页闪烁。
- 加载过程不改变容器高度，避免布局跳动。

### 9.3 错误状态

- 说明失败对象和用户可采取的下一步。
- 可恢复错误提供“重试”，权限错误提供权限说明，不统一使用“系统异常”。
- 表单错误放在对应字段下方，同时提供颜色、图标和文字。

## 10. 交互与可访问性

- 所有可交互元素必须可通过键盘访问，焦点顺序与视觉顺序一致。
- `focus-visible` 使用 `2px` 主颜色焦点环和 `2px` 偏移。
- 桌面端点击区域不小于 `32 × 32px`，触屏不小于 `44 × 44px`。
- hover 只是增强反馈，不承载唯一信息或唯一操作入口。
- 动效时长使用 `120–200ms`；支持 `prefers-reduced-motion: reduce`。
- 标题截断后应能通过 tooltip 或详情页获取完整文本。

## 11. 验收清单

### 11.1 布局

- [ ] 主内容左右内边距一致，宽屏下留白对称。
- [ ] 页面标题与一级 Tab 间距为 `4px`。
- [ ] 工具栏与分类标签行间距为 `16px`。
- [ ] 分类标签行与卡片网格间距为 `16px`。
- [ ] 所有卡片网格 gap 为 `16px`。

### 11.2 卡片

- [ ] 标准资源卡在相同内容宽度下列数一致。
- [ ] Widget 广场与我的 Widget 列数一致，最多 3 列。
- [ ] 不存在 `auto-fit` 造成的卡片拉伸。
- [ ] 同一行卡片等宽等高，最后一行不改变卡片宽度。
- [ ] 卡片描述不足两行时仍保留两行高度。
- [ ] MCP 卡片高度为 `184px`，描述与分割线间距为 `12px`。
- [ ] 角标不参与标题宽度计算，我的 MCP 不显示角标。

### 11.3 响应式

- [ ] 在内容宽度 `511 / 512 / 775 / 776 / 1039 / 1040 / 1303 / 1304px` 逐一检查标准卡列数。
- [ ] 在内容宽度 `655 / 656 / 991 / 992px` 逐一检查 Widget 列数。
- [ ] 在工具栏宽度 `559 / 560 / 759 / 760px` 逐一检查折行。
- [ ] 工具栏换行时右侧操作组保持完整并右对齐。
- [ ] 小屏下不存在水平页面滚动，文字不与图标、角标、按钮重叠。

### 11.4 交互

- [ ] 按钮、输入框、下拉框和 Tab 具有完整的 hover、active、focus-visible 和 disabled 状态。
- [ ] 纯图标操作有可访问名称和 tooltip。
- [ ] 加载、空状态和错误状态不导致主布局跳动。

## 12. 开发约束摘要

1. 页面级响应式优先使用容器查询，不用 viewport 猜测扣除侧边栏后的宽度。
2. 标准资源卡和 Widget 卡分属两套规则，两者不得混用选择器。
3. 标准资源页之间必须复用同一个网格类，不允许每个页面单独配断点。
4. 列数使用 `repeat(n, minmax(0, 1fr))`，不使用 `auto-fit`、`auto-fill` 或卡片数量分支。
5. 卡片子元素使用 `min-width: 0`，长文本使用截断或两行省略，禁止撑宽网格。
6. 新页面接入前必须按验收清单跑过所有临界宽度。
