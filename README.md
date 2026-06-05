# OCA - 老人看护系统

基于 Spring Boot + UniApp 开发的老人看护系统，提供位置追踪、健康数据管理、电子围栏等功能。

## 项目结构

```
OCA/
├── backend/                    # 后端服务
│   ├── src/main/java/          # Java 源代码
│   ├── src/main/resources/     # 配置文件
│   └── sql/                    # 数据库脚本
├── frontend_elderly/           # 老人端 App
├── frontend_guardian/          # 监护端 App
└── frontend_new/               # 备用前端
```

## 技术栈

### 后端
- Java 21
- Spring Boot 3.2.0
- Spring Security + JWT
- MyBatis Plus
- MySQL 8.0+
- Redis

### 前端
- UniApp (Vue 3 + TypeScript)
- 天地图 API
- SCSS

## 快速开始

### 1. 环境要求

- JDK 21+
- Maven 3.6+
- MySQL 8.0+
- Redis 6.0+
- HBuilderX (用于 UniApp 开发)

### 2. 数据库配置

创建数据库：

```sql
CREATE DATABASE elder_care CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

创建用户：

```sql
CREATE USER 'eldercare'@'localhost' IDENTIFIED BY 'eldercare123';
GRANT ALL PRIVILEGES ON elder_care.* TO 'eldercare'@'localhost';
FLUSH PRIVILEGES;
```

### 3. 运行后端

```bash
cd backend
mvn spring-boot:run
```

服务将在 `http://localhost:8080/api` 启动。

### 4. 运行前端

使用 HBuilderX 打开 `frontend_elderly` 或 `frontend_guardian`，运行到模拟器或真机。

## API 接口

### 认证接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/auth/login` | 用户登录 |
| POST | `/auth/register` | 用户注册 |

### 位置接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/location` | 上传位置 |
| GET | `/location/elderly/{id}/today` | 获取今日轨迹 |

### 绑定接口
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/binding/apply` | 申请绑定 |
| GET | `/binding/list` | 获取绑定列表 |

## 测试用户

### 监护端
- 手机号：`13800138001`
- 密码：`123456`

### 老人端
- 手机号：`13900139001`
- 密码：`123456`

## 功能特性

- ✅ 用户注册/登录
- ✅ 老人与监护人绑定
- ✅ 实时位置追踪
- ✅ 历史轨迹查询
- ✅ 电子围栏设置
- ✅ 健康数据管理
- ✅ SOS 紧急呼叫

## 配置说明

后端配置文件：`backend/src/main/resources/application.yml`

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/elder_care
    username: eldercare
    password: eldercare123
```

## 许可证

MIT License