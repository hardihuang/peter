# Dashscope Provider Configuration Plugin

一个用于管理阿里云 Dashscope 模型服务的 OpenClaw CLI 插件，提供简洁的命令行工具来配置和切换多区域 Dashscope provider。

## 核心特性

- **多区域支持**：支持国内、国际、美国三个标准端点，以及国内外两个 Coding Plan 端点
- **智能识别**：自动识别当前使用的 provider，无需手动指定
- **模型验证**：自动调用 API 验证模型，或使用内置 Coding Plan 模型列表
- **配置热更新**：修改配置后 OpenClaw Gateway 自动重载，无需重启
- **类型安全**：完整的 TypeScript 类型定义，确保配置正确性

## 支持的端点

### Standard Endpoints（标准端点）

使用 `/compatible-mode/v1` 路径，支持完整的模型 API：

| 区域 | Provider ID      | Endpoint                              |
| ---- | ---------------- | ------------------------------------- |
| 国内 | `dashscope`      | `https://dashscope.aliyuncs.com`      |
| 国际 | `dashscope-intl` | `https://dashscope-intl.aliyuncs.com` |
| 美国 | `dashscope-us`   | `https://dashscope-us.aliyuncs.com`   |

### Coding Plan Endpoints（编码计划端点）

使用 `/v1` 路径，使用内置模型列表：

| 区域 | Provider ID             | Endpoint                                     |
| ---- | ----------------------- | -------------------------------------------- |
| 国内 | `dashscope-coding`      | `https://coding.dashscope.aliyuncs.com`      |
| 国际 | `dashscope-coding-intl` | `https://coding-intl.dashscope.aliyuncs.com` |

## CLI 命令

### 1. set-provider - 配置 Provider

初始化或更新 Dashscope provider 配置（baseUrl、apiKey、初始模型）。

```bash
# 基础用法（推荐使用环境变量）
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
openclaw dashscope set-provider \
  --endpoint https://dashscope-intl.aliyuncs.com \
  --model qwen3.5-plus

# 完整参数（直接指定 API Key）
openclaw dashscope set-provider \
  --endpoint https://dashscope.aliyuncs.com \
  --api-key sk-xxxxxxxxxxxxx \
  --model qwen3.5-plus

# 配置 Coding Plan 端点
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
openclaw dashscope set-provider \
  --endpoint https://coding-intl.dashscope.aliyuncs.com \
  --model qwen3-coder-plus
```

**参数说明：**

- `--endpoint <url>`：必填，Dashscope 端点 URL
- `--api-key <key>`：可选，API Key（也可使用环境变量 `DASHSCOPE_API_KEY`）
- `--model <modelId>`：可选，初始模型 ID（默认 `qwen3.5-plus`）

**功能说明：**

- 自动识别端点类型（Standard 或 Coding Plan）
- 自动构造正确的 baseUrl（添加 `/compatible-mode/v1` 或 `/v1`）
- 验证模型是否存在（Standard 端点调用 API，Coding Plan 使用内置列表）
- 更新 `models.providers[providerId]` 和 `agents.defaults`
- 设置该模型为 primary model

### 2. show-provider - 查看当前 Provider

显示当前使用的 Dashscope provider 配置和模型列表。

```bash
# 人类可读格式
openclaw dashscope show-provider

# JSON 格式输出
openclaw dashscope show-provider --json
```

**输出示例：**

```
Dashscope Provider ID: dashscope-intl
Dashscope baseUrl: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
Dashscope apiKey: [set]
Dashscope models: qwen3.5-plus, qwen3-max-2026-01-23
```

**功能说明：**

- 自动从 `agents.defaults.model.primary` 解析当前 provider ID
- 只显示当前正在使用的 Dashscope provider
- 列出该 provider 下所有已配置的模型

### 3. set-model - 设置/切换模型

在当前 provider 内切换模型，如果模型不存在则自动获取并添加。

```bash
# 切换到指定模型
openclaw dashscope set-model --model qwen3-max-2026-01-23

# 切换到 Coding Plan 模型
openclaw dashscope set-model --model qwen3-coder-next
```

**功能说明：**

- 自动识别当前 provider（从 `agents.defaults.model.primary` 解析）
- 检查模型是否已存在于 `models.providers[providerId].models`
- 如果不存在，调用 API 获取模型详情并添加到配置
- 更新 `agents.defaults.model.primary` 为新模型
- 保持现有的 `fallbacks` 不变

**Provider-Aware 特性：**

- 只在当前 provider 内切换，无需指定 provider ID
- 例如当前使用 `dashscope-intl/qwen3.5-plus`，切换后变为 `dashscope-intl/qwen3-max-2026-01-23`
- 不会影响其他 provider 的配置

### 4. verify-model - 验证模型

验证指定模型是否可用，并显示模型详细信息（JSON 格式）。

```bash
# 使用当前 provider 验证
openclaw dashscope verify-model qwen3.5-plus

# 指定 endpoint 和 API Key 验证
openclaw dashscope verify-model qwen3-max-2026-01-23 \
  --endpoint https://dashscope-intl.aliyuncs.com \
  --api-key sk-xxxxxxxxxxxxx

# 使用环境变量验证
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
openclaw dashscope verify-model kimi-k2.5 \
  --endpoint https://coding-intl.dashscope.aliyuncs.com
```

**输出示例：**

```json
{
  "providerId": "dashscope-intl",
  "id": "qwen3.5-plus",
  "name": "Qwen3.5-Plus",
  "api": "openai-completions",
  "reasoning": false,
  "input": ["text", "image"],
  "contextWindow": 1000000,
  "maxTokens": 65536
}
```

**功能说明：**

- 不指定 `--endpoint` 时，使用当前 provider 的配置
- API Key 优先级：CLI 参数 > 配置文件 > 环境变量
- Standard 端点调用 `/api/v1/models` API
- Coding Plan 端点使用内置模型列表

## Coding Plan 支持的模型

Coding Plan 端点内置以下模型（无需 API 验证）：

| 模型 ID                | 模型名称             | 输入模态   | 上下文窗口 | 最大输出 |
| ---------------------- | -------------------- | ---------- | ---------- | -------- |
| `qwen3.5-plus`         | Qwen3.5-Plus         | 文本、图像 | 100万      | 64K      |
| `qwen3-max-2026-01-23` | Qwen3-Max-2026-01-23 | 文本       | 26万       | 64K      |
| `qwen3-coder-next`     | Qwen3-Coder-Next     | 文本       | 26万       | 64K      |
| `qwen3-coder-plus`     | Qwen3-Coder-Plus     | 文本       | 100万      | 64K      |
| `MiniMax-M2.5`         | MiniMax-M2.5         | 文本       | 100万      | 64K      |
| `glm-5`                | GLM-5                | 文本       | 20万       | 16K      |
| `glm-4.7`              | GLM-4.7              | 文本       | 20万       | 16K      |
| `kimi-k2.5`            | Kimi-K2.5            | 文本、图像 | 26万       | 32K      |

## 典型使用流程

### 场景 1：首次配置 Standard 端点

```bash
# 1. 设置环境变量
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx

# 2. 配置国际端点
openclaw dashscope set-provider \
  --endpoint https://dashscope-intl.aliyuncs.com \
  --model qwen3.5-plus

# 3. 查看配置
openclaw dashscope show-provider

# 4. 切换到其他模型
openclaw dashscope set-model --model qwen3-max-2026-01-23
```

### 场景 2：使用 Coding Plan 端点

```bash
# 1. 配置 Coding Plan 国际端点
export DASHSCOPE_API_KEY=sk-xxxxxxxxxxxxx
openclaw dashscope set-provider \
  --endpoint https://coding-intl.dashscope.aliyuncs.com \
  --model qwen3-coder-plus

# 2. 验证模型
openclaw dashscope verify-model qwen3-coder-next

# 3. 切换模型
openclaw dashscope set-model --model kimi-k2.5
```

### 场景 3：在多个 Provider 间切换

```bash
# 配置国内 Standard
openclaw dashscope set-provider \
  --endpoint https://dashscope.aliyuncs.com \
  --model qwen3.5-plus

# 配置国际 Coding Plan
openclaw dashscope set-provider \
  --endpoint https://coding-intl.dashscope.aliyuncs.com \
  --model qwen3-coder-plus

# 后续使用 set-model 只会在当前 provider 内切换
# 例如当前使用 dashscope-coding-intl/qwen3-coder-plus
openclaw dashscope set-model --model kimi-k2.5
# 结果：dashscope-coding-intl/kimi-k2.5
```

## 配置文件示例

完成配置后，`openclaw.json` 包含以下内容：

```json
{
  "models": {
    "providers": {
      "dashscope-intl": {
        "baseUrl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
        "api": "openai-completions",
        "auth": "api_key",
        "apiKey": "sk-xxxxxxxxxxxxx",
        "models": [
          {
            "id": "qwen3.5-plus",
            "name": "Qwen3.5-Plus",
            "api": "openai-completions",
            "reasoning": false,
            "input": ["text", "image"],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 65536
          },
          {
            "id": "qwen3-max-2026-01-23",
            "name": "Qwen3-Max-2026-01-23",
            "api": "openai-completions",
            "reasoning": false,
            "input": ["text"],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 262144,
            "maxTokens": 65536
          }
        ]
      },
      "dashscope-coding-intl": {
        "baseUrl": "https://coding-intl.dashscope.aliyuncs.com/v1",
        "api": "openai-completions",
        "auth": "api_key",
        "apiKey": "sk-xxxxxxxxxxxxx",
        "models": [
          {
            "id": "qwen3-coder-plus",
            "name": "Qwen3-Coder-Plus",
            "api": "openai-completions",
            "reasoning": false,
            "input": ["text"],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 65536
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "dashscope-intl/qwen3.5-plus",
        "fallbacks": []
      },
      "models": {
        "dashscope-intl/qwen3.5-plus": {
          "alias": "qwen3.5-plus"
        },
        "dashscope-intl/qwen3-max-2026-01-23": {
          "alias": "qwen3-max-2026-01-23"
        },
        "dashscope-coding-intl/qwen3-coder-plus": {
          "alias": "qwen3-coder-plus"
        }
      }
    }
  }
}
```

## API Key 优先级

所有命令的 API Key 解析优先级为：

1. **CLI 参数** `--api-key`（最高优先级）
2. **配置文件** `models.providers[providerId].apiKey`
3. **环境变量** `DASHSCOPE_API_KEY`（最低优先级）

**推荐实践：**

- CI/CD 环境：使用 CLI 参数或环境变量
- 开发环境：使用环境变量（在 `.bashrc` 或 `.zshrc` 中设置）
- 生产环境：运行 `set-provider` 后，API Key 会保存在配置文件中

## 注意事项

1. **Endpoint 自动转换**
   - Standard endpoint 自动添加 `/compatible-mode/v1`
   - Coding Plan endpoint 自动添加 `/v1`
   - 无需手动拼接完整路径

2. **Provider ID 自动识别**
   - 所有命令（除 `set-provider`）都自动从当前 primary model 解析 provider ID
   - 例如 primary model 为 `dashscope-intl/qwen3.5-plus`，则 provider ID 为 `dashscope-intl`

3. **模型验证**
   - Standard endpoint：调用 `/api/v1/models` API 验证（需要网络连接）
   - Coding Plan endpoint：使用内置列表验证（无需网络）

4. **配置热更新**
   - OpenClaw Gateway 使用 chokidar 监控 `openclaw.json`
   - 配置修改后自动重载，无需重启 gateway 或应用

5. **多 Provider 支持**
   - 可以同时配置多个 Dashscope provider（例如国内 + 国际）
   - 每个 provider 有独立的 baseUrl、apiKey、models
   - 通过 `set-provider` 切换不同区域时，primary model 会更新为对应的 provider

## 故障排查

### 错误：No primary model configured

**原因**：尚未配置任何 provider 或 primary model。

**解决**：运行 `openclaw dashscope set-provider` 初始化配置。

### 错误：Current provider XXX is not a Dashscope provider

**原因**：当前 primary model 使用的不是 Dashscope provider（例如 OpenAI、Anthropic）。

**解决**：

- 如果想使用 Dashscope，运行 `openclaw dashscope set-provider`
- 如果想保持其他 provider，使用完整的 OpenClaw 命令（如 `openclaw models ...`）

### 错误：Model XXX not found

**原因**：

- Standard endpoint：模型 ID 拼写错误或该模型不存在
- Coding Plan endpoint：模型不在内置列表中

**解决**：

- 检查模型 ID 拼写
- 查看本文档"Coding Plan 支持的模型"部分
- 使用 `openclaw dashscope verify-model` 验证模型

### 错误：Invalid endpoint URL

**原因**：endpoint 参数格式错误（不是有效的 URL）。

**解决**：确保 endpoint 以 `https://` 开头，例如 `https://dashscope-intl.aliyuncs.com`。

### 错误：HTTP 401 Unauthorized

**原因**：API Key 无效或已过期。

**解决**：

- 检查 API Key 是否正确（通常以 `sk-` 开头）
- 登录阿里云控制台重新生成 API Key
- 确认 API Key 有访问对应模型的权限

## 技术实现

- **插件 ID**：`dashscope-cfg`
- **插件类型**：CLI Plugin
- **认证方式**：API Key (`api_key`)
- **API 模式**：OpenAI Compatible (`openai-completions`)
- **配置方式**：Config Patch（增量更新配置文件）
- **版本**：2026.2.26

## 开发信息

**代码优化亮点：**

- 提取通用函数（`parseProviderIdFromConfig`、`validateDashscopeProvider`、`getProviderConfig`、`resolveApiKey`）
- 减少重复代码约 150 行
- 统一错误处理逻辑
- 提升代码可维护性和可测试性

**核心函数：**

- `getProviderIdFromEndpoint()`：根据 endpoint URL 返回 provider ID
- `isCodingPlanProvider()`：判断是否为 Coding Plan 端点
- `verifyModelAndGetModelDefinition()`：验证模型并返回 ModelDefinition
- `buildModelDefinition()`：将 Dashscope API 响应转换为 OpenClaw 格式

## 许可证

遵循 OpenClaw 主项目许可证。
