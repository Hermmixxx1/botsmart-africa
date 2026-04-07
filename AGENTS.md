# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Payment**: Stripe (Multi-vendor Connect - pending integration)

### 业务配置

- **企业名称**: The Lebogang Group
- **目标市场**: 南部非洲（12个国家）
- **默认国家**: 南非 (ZA)
- **默认货币**: 南非兰特 (ZAR)
- **默认语言**: 英语 (en-ZA)
- **支持国家**: ZA, NA, BW, ZW, MZ, LS, SZ, AO, ZM, MW, MG, TZ
- **支持货币**: ZAR, NAD, BWP, ZWL, MZN, LSL, SZL, AOA, ZMW, MWK, MGA, TZS
- **支持语言**: en, af, pt, zu, xhosa, st, tn, sw, ny (15种语言)

### 安全特性

- **速率限制**: API端点每15分钟100次请求
- **CSRF保护**: 基于令牌的跨站请求伪造防护
- **XSS防护**: 输入清理和输出编码
- **输入验证**: 邮箱、电话、密码强度验证
- **安全头**: CSP, HSTS, X-Frame-Options等
- **审计日志**: 完整的用户和管理员操作跟踪
- **IP白名单**: 管理员访问IP限制（可选）

### 区域配置文件

- `src/lib/region-config.ts` - 国家、货币、语言配置
- `src/lib/security.ts` - 安全工具和中间件
- `src/lib/audit-logger.ts` - 审计日志系统
- `SOUTHERN_AFRICA_CONFIG.md` - 完整的区域配置文档

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API 路由
│   │   │   ├── admin/      # 管理员 API
│   │   │   │   ├── admins/         # 管理员管理
│   │   │   │   ├── pages/          # 页面管理
│   │   │   │   ├── roles/          # 角色管理
│   │   │   │   ├── settings/       # 站点设置
│   │   │   │   ├── products/       # 产品管理
│   │   │   │   ├── orders/         # 订单管理
│   │   │   │   └── sellers/        # 卖家管理
│   │   │   ├── seller/      # 卖家 API
│   │   │   │   ├── products/       # 卖家产品
│   │   │   │   └── orders/         # 卖家订单
│   │   │   ├── pages/[slug]/       # 公开页面
│   │   │   └── settings/           # 公开设置
│   │   ├── admin/          # 管理员页面
│   │   │   ├── super/               # 超级管理员仪表板
│   │   │   ├── settings/           # 站点设置页面
│   │   │   ├── pages/               # 页面管理
│   │   │   ├── admins/              # 管理员管理
│   │   │   ├── products/            # 产品管理
│   │   │   ├── orders/              # 订单管理
│   │   │   └── sellers/             # 卖家管理
│   │   ├── seller/         # 卖家页面
│   │   │   ├── register/            # 卖家注册
│   │   │   └── dashboard/           # 卖家仪表板
│   │   ├── page/[slug]/   # 动态页面 (CMS)
│   │   └── ...
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── lib/                # 工具库
│   │   ├── rbac.ts         # RBAC 权限系统
│   │   ├── auth.ts         # 认证工具
│   │   └── utils.ts        # 通用工具函数
│   └── storage/            # 数据库
│       └── database/
│           └── shared/
│               ├── schema.ts       # 数据库架构
│               └── supabase-client.ts  # Supabase 客户端
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 多卖家电商平台架构

### 用户角色系统

项目实现了完整的 RBAC (Role-Based Access Control) 权限系统：

#### 1. 用户类型
- **Customer (客户)**: 普通购物用户，可以浏览产品、添加到购物车、下单、查看订单
- **Seller (卖家)**:
  - Individual (个人卖家): 自动审批
  - Business (企业卖家): 需管理员审批，需提供营业执照
- **Admin (管理员)**:
  - Super Admin (超级管理员): 完全控制权，管理所有功能
  - Admin (管理员): 有限权限（产品、订单、客户管理）
  - Manager (经理): 更有限权限（产品、订单只读）

#### 2. 权限系统
- 所有权限定义在 `src/lib/rbac.ts` 中的 `PERMISSIONS` 对象
- 角色权限定义在数据库 `admin_roles` 表中
- 权限检查通过中间件函数：
  - `requireAuth()`: 需要登录
  - `requireAdmin()`: 需要管理员权限
  - `requireSuperAdmin()`: 需要超级管理员权限
  - `requirePermission()`: 需要特定权限

#### 3. 数据库表结构

**管理员相关表**:
- `admin_roles`: 角色定义，包含权限数组
- `admin_users`: 管理员用户，关联角色

**CMS 相关表**:
- `pages`: 页面管理，支持 HTML 内容、SEO 元数据、发布状态
- `site_settings`: 站点设置，包含品牌、颜色、字体、联系方式、政策等

**卖家相关表**:
- `seller_profiles`: 卖家资料，包含类型、状态、银行信息、Stripe 账户

**产品与订单表**:
- `products`: 产品表，支持多卖家 (`seller_id`)
- `orders`: 订单表，包含平台费
- `order_items`: 订单项，包含卖家分账金额 (`seller_payout`, `platform_fee`, `payout_status`)

### 核心 API 端点

#### 管理员 API (所有需要 RBAC 验证)
- `GET/POST /api/admin/pages` - 页面管理
- `GET/PATCH/DELETE /api/admin/pages/[id]` - 单个页面管理
- `GET/PATCH /api/admin/settings` - 站点设置（仅超级管理员）
- `GET/POST /api/admin/admins` - 管理员管理（仅超级管理员）
- `GET/PATCH/DELETE /api/admin/admins/[id]` - 单个管理员管理
- `GET/POST /api/admin/roles` - 角色管理（仅超级管理员）
- `GET/POST /api/admin/sellers` - 卖家管理
- `GET/PATCH /api/admin/sellers/admin/[id]` - 卖家审批（管理员）

#### 卖家 API
- `POST /api/sellers` - 卖家注册
- `GET /api/sellers` - 获取当前卖家资料
- `GET /api/seller/products` - 获取卖家产品列表
- `GET /api/seller/orders` - 获取卖家订单和收益

#### 公开 API
- `GET /api/pages/[slug]` - 获取公开页面
- `GET /api/settings` - 获取公开站点设置

### 管理面板功能

#### 超级管理员仪表板 (`/admin/super`)
- 实时统计：总收入、订单数、产品数、卖家数、待审批卖家
- 快速操作：站点设置、管理员管理、页面管理、卖家审批
- 完整权限访问所有功能

#### 站点设置 (`/admin/settings`)
- **General**: 商店名称、平台费百分比
- **Appearance**: Logo、Favicon、主色调、次色调、字体
- **Contact**: 联系邮箱、电话、社交媒体链接
- **Policies**: 配送政策、退货政策、隐私政策、服务条款

#### 页面管理 (`/admin/pages`)
- 创建、编辑、删除页面
- 支持 HTML 内容编辑
- URL Slug 管理
- SEO 元数据（Meta Title, Meta Description）
- 发布/草稿状态控制
- 实时预览

#### 管理员管理 (`/admin/admins`)
- 查看所有管理员及其角色
- 创建新管理员（需要 Super Admin 权限）
- 更新管理员角色和状态
- 删除管理员（防止删除自己）

### 卖家功能

#### 卖家注册 (`/seller/register`)
- 支持个人卖家和企业卖家
- 企业卖家需上传营业执照
- 银行账户信息（用于分账）
- 自动生成待审批状态

#### 卖家仪表板 (`/seller/dashboard`)
- 账户状态显示（待审批/已批准/已拒绝）
- 产品管理：查看、编辑、添加产品
- 订单管理：查看订单、分账金额、支付状态
- 收益统计：总收入、待支付金额
- 拒绝理由显示（如被拒绝）

### 分账系统

- **平台费**: 默认 10%（可在站点设置中配置）
- **卖家分账**: 销售额的 90%（自动计算）
- **订单项级别分账**: 每个订单项单独计算平台费和卖家分账
- **分账状态**: `pending` (待支付), `paid` (已支付)
- **支持**: 多卖家订单，每个订单项归属不同卖家

### 安全特性

1. **RBAC 严格验证**: 所有管理员 API 都经过权限验证
2. **RLS (Row-Level Security)**: 数据库层面的行级安全（待实现）
3. **HTTPS**: 生产环境强制 HTTPS
4. **输入验证**: 所有 API 端点使用 Zod 进行输入验证
5. **错误处理**: 统一的错误处理机制

### 待完成功能

1. **Stripe Connect 集成**:
   - 卖家 Stripe 账户创建和连接
   - 多卖家支付流程
   - 自动分账到卖家账户
   - Payout 管理

2. **RLS 策略实现**:
   - 卖家只能查看自己的产品和订单
   - 管理员只能查看有权限的数据
   - 用户只能查看自己的订单和地址

3. **额外功能**:
   - 邮件通知系统
   - 卖家数据分析
   - 管理员活动日志
   - 批量操作
   - 导入/导出功能

### 常见问题

**Q: 如何创建超级管理员？**
A: 需要在数据库中手动插入 `admin_users` 记录，关联到 `super_admin` 角色。

**Q: 卖家审批流程是什么？**
A: 个人卖家自动审批，企业卖家需要管理员在 `/admin/sellers` 页面审批。

**Q: 如何修改平台费？**
A: 超级管理员可在 `/admin/settings` 页面修改平台费百分比。

**Q: CMS 页面支持什么格式？**
A: 支持 HTML 格式内容，可以使用任何 HTML 标签和内联样式。

**Q: 如何备份站点设置？**
A: 站点设置存储在 `site_settings` 表中，可以通过数据库查询导出。


