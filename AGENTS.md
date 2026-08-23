# AGENTS.md

## 项目定位

本项目是“农域后台管理系统”的前端管理端，产品定位是农业与地图可视化结合的智慧农业 GIS 后台。当前代码基座是 React 后台模板，业务功能正在从同级目录的 `../diyue-platform-frontend` 逐步迁移到本项目。

在这个仓库里协作时，请遵循两个原则：

- 优先贴合当前真实代码结构和依赖，不要按其他项目的技术栈想当然开发。
- 优先做小步、可验证、低风险的改动，不要顺手做与需求无关的大重构。

`../diyue-platform-frontend` 是已实现功能的 Vue 版本迁移源，本项目是 React 目标实现。迁移时参考旧项目的页面行为、接口、类型、资源和 GIS 交互，再使用当前项目的 React 技术栈重写；不要把 Vue、Pinia、Element Plus 代码直接复制进来。当前 React 仓库仍在迁移阶段，因此必须先确认目标功能是否已经落地，不能仅凭菜单或旧项目实现判断本项目已经具备对应能力。

## 当前技术栈

请以 `package.json` 和现有源码为准。当前项目主要技术栈如下：

- React 18
- TypeScript
- Vite
- React Router v6
- Redux + react-redux + redux-persist
- redux-thunk + redux-promise
- Ant Design 4
- Less
- Axios
- i18next + react-i18next
- ECharts

GIS 功能的目标技术路线是 React + OpenLayers；涉及地图功能时还可能使用 Turf.js。当前是否已经安装对应依赖必须以 `package.json` 为准，不要因为产品定位而假设地图依赖和功能已经迁移完成。

以下技术不属于当前项目默认栈，除非需求明确要求且代码已引入，否则不要按这些方向写：

- Vue / Nuxt
- Pinia
- Element Plus
- Tailwind CSS
- Zustand / MobX

## 目录约定

当前仓库的核心目录以 `src/` 为中心，协作时优先遵守现有分层：

```txt
src/
├─ api/              # 接口封装与请求层
├─ assets/           # 图片、字体、svg、iconfont 等静态资源
├─ components/       # 可复用组件
├─ config/           # 全局配置与初始化逻辑
├─ directives/       # 自定义指令
├─ enums/            # 枚举常量
├─ hooks/            # 通用 Hooks
├─ language/         # i18n 配置
├─ layouts/          # 后台布局
├─ redux/            # Redux store 与各模块状态
├─ routers/          # 路由定义与守卫
├─ styles/           # 全局样式、主题变量
├─ typings/          # 全局类型声明
├─ utils/            # 工具函数
└─ views/            # 页面级模块
```

几个关键入口文件：

- `src/main.tsx`：应用启动入口，挂载 Redux、持久化、全局样式、字体、svg 图标注册。
- `src/App.tsx`：挂载 `HashRouter`、Ant Design `ConfigProvider`、i18n 切换、主题逻辑。
- `src/routers/index.tsx`：汇总根路由，基于 `import.meta.glob("./modules/*.tsx")` 自动导入模块路由。
- `src/redux/index.ts`：创建 store、redux-persist、thunk/promise 中间件。
- `src/api/request.ts`：axios 实例与请求/响应拦截。

## React 与组件约定

- 使用函数组件和 Hooks。
- 页面组件放在 `src/views/` 下，共享组件放在 `src/components/` 下。
- 布局相关代码放在 `src/layouts/`，不要把页面逻辑硬塞进布局组件。
- 避免把复杂业务逻辑直接堆在 JSX 里，适当拆到 hooks、utils 或局部函数。
- 现有代码同时存在 Hooks 风格和 `connect` 风格的 Redux 用法。修改已有文件时优先保持原风格，不要为了“统一”而做无关重构。
- 新增组件命名优先使用 PascalCase，页面目录命名保持与现有目录风格一致。

## TypeScript 约定

- 优先补齐类型，不要扩大 `any` 的使用范围。
- API 响应、表单模型、表格行数据、路由 meta、主题配置等都应尽量有明确类型。
- 业务类型优先靠近业务模块放置；通用类型放到 `src/typings/` 或对应公共目录。
- 修改老代码时可以接受局部兼容，但不要把新的弱类型写法继续扩散。

## 路由、菜单与权限

当前项目的路由与菜单联动关系比较紧，修改时要一起考虑：

- 路由模块放在 `src/routers/modules/*.tsx`。
- 根路由在 `src/routers/index.tsx` 汇总。
- 登录态与鉴权由 `src/routers/utils/authRouter.tsx` 控制。
- 页面标签、面包屑、菜单、按钮权限与 Redux 状态有关。

新增或调整页面时，请同步检查：

- 路由 `path`
- 路由 `meta.title`
- 路由 `meta.key`
- 是否需要 `requiresAuth`
- 菜单高亮、标签页、面包屑是否受影响

不要在没有确认影响范围的情况下，随意把 `HashRouter` 改成 `BrowserRouter`。

## Redux 使用约定

当前仓库使用的是传统 Redux 组织方式，不是 Redux Toolkit。请遵守现有结构：

- `src/redux/modules/` 下按领域拆分状态模块
- 当前已有 `global`、`menu`、`tabs`、`auth`、`breadcrumb` 等模块
- 持久化由 `redux-persist` 管理

建议：

- 跨页面共享、需要持久化、会影响布局或权限的状态再放入 Redux
- 仅当前页面使用的筛选项、弹窗开关、局部 loading 等优先留在组件本地状态
- 不要顺手把整个项目迁移到 Redux Toolkit、Zustand、MobX 或其他状态库

## API 与数据流约定

- 接口逻辑优先放在 `src/api/` 下统一管理。
- 复用已有请求封装，避免在页面组件里散落大量原始 axios 调用。
- 请求参数、响应结构尽量定义类型，必要时在 API 层做适配与转换。
- 页面层应更关注“展示和交互”，数据转换逻辑尽量不要四处重复。

如果要新增环境变量或接口配置，请先核对这些文件：

- `.env`
- `.env.development`
- `.env.test`
- `.env.production`
- `vite.config.ts`

不要在未确认命名规则的情况下新增一套平行环境变量。

## 样式与 UI 约定

当前项目使用 Less，不要混入另一套主样式体系。

- 全局样式在 `src/styles/`
- 主题相关样式在 `src/styles/theme/`
- 页面或组件样式优先就近放在对应目录的 `index.less`
- 变量与公共样式优先复用现有 `var.less`、`common.less`、主题文件

UI 方面请保持与现有后台风格一致：

- 基于 Ant Design 4 生态扩展
- 以清晰、稳重、易维护为主
- 避免无必要引入新的 UI 框架
- 避免把一个简单需求扩散成全站视觉重做

图标资源优先复用：

- `src/assets/icons/` 中的 svg 图标
- `src/assets/iconfont/` 中的 iconfont
- `src/components/svgIcon/` 相关能力

## i18n、主题与全局配置

项目已接入国际化和主题逻辑，尽管不是所有页面都完整国际化，但修改全局能力时要注意兼容：

- i18n 初始化在 `src/language/`
- Ant Design 语言切换在 `src/App.tsx`
- 主题逻辑依赖 `src/hooks/useTheme.ts`
- 全局配置状态在 Redux 的 `global` 模块中

如果只是做局部文案调整，不必强行把整页全部国际化；但如果修改的是全局公共文案、通用组件或布局区域，请先检查现有语言切换逻辑是否会受影响。

## 业务改动建议

这个仓库目前仍保留不少后台模板特征，例如：

- Dashboard
- 表单页
- 图表页
- 嵌套路由菜单
- 外链页
- 登录页

当你把它向“农域后台管理系统”继续演进时，推荐遵守以下策略：

- 以现有模块为基础渐进替换，不要一次性推翻模板结构
- 农业业务页优先放到 `src/views/` 下按领域分目录
- 若引入地块、任务、设备、组织等业务实体，先定义清晰的数据模型与路由层级
- 迁移 GIS 功能时，先核对旧项目的 OpenLayers 实现、坐标系、数据格式、图层和交互，再按 React 生命周期重新实现

不要因为项目名称与业务方向里出现“农业”就默认仓库已经具备完整农业业务模型。

## 依赖与脚本约定

执行命令前请先看 `package.json`。当前常用脚本包括：

```bash
npm run dev
npm run serve
npm run build:dev
npm run build:test
npm run build:pro
npm run lint:eslint
npm run lint:prettier
npm run lint:stylelint
```

补充约定：

- 仓库同时存在 `package-lock.json` 和 `yarn.lock`，不要随手再引入新的包管理锁文件
- 需要安装依赖时，优先延续当前分支已经在使用的包管理方式
- 没有现成测试脚本时，不要虚构 `test`、`type-check`、`pnpm` 命令

## 禁止事项

- 不要把项目按 Vue/Pinia/Element Plus 的思路来改
- 不要为了一个小需求顺手重写路由、布局、状态管理
- 不要无依据引入大型依赖或新 UI 框架
- 不要修改与当前任务无关的大量文件
- 不要因为旧 Vue 项目已经实现 GIS、地图或轨迹功能，就假设这些能力已经迁移到当前 React 项目
- 不要在页面里到处复制接口请求和重复转换逻辑
- 不要把临时调试代码、无用注释、废弃样式留在提交结果里

## 验证建议

完成改动后，优先根据改动范围选择验证方式：

- 样式或页面文案：本地页面确认、检查布局是否错位
- 路由或菜单：检查跳转、菜单高亮、标签页、面包屑
- Redux 相关：检查刷新后持久化状态是否符合预期
- 接口相关：检查请求参数、响应处理、异常分支

不要执行构建命令去验证，只在代码层验证代码是否符合预期即可，页面布局、样式、文案等都需要在本地确认。

常见验证命令：

```bash
npm run lint:eslint
npm run lint:prettier
npm run lint:stylelint
```

如果某项验证没有执行，需要在最终说明里明确告诉协作者。

## Agent 工作方式

每次接到任务后，默认按下面顺序推进：

1. 先确认需求影响的是页面、布局、路由、Redux、接口还是构建配置
2. 再读取对应目录下的真实代码，不凭旧模板经验直接下手
3. 尽量做最小必要修改
4. 修改后检查受影响的相邻模块
5. 在交付说明里讲清楚改了什么、没验证什么、还有什么风险

如果需求与当前仓库实现明显冲突，请先以“当前真实代码”为准，而不是以历史文档、模板印象或其他项目习惯为准。
