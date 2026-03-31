import { emptyPluginConfigSchema, type OpenClawPluginApi } from "openclaw/plugin-sdk";

/**
 * Dashscope Provider ID 枚举
 */
const DashscopeProviderId = {
  /** 国内标准端点 */
  DASHSCOPE: "dashscope",
  /** 国际标准端点 */
  DASHSCOPE_INTL: "dashscope-intl",
  /** 美国标准端点 */
  DASHSCOPE_US: "dashscope-us",
  /** 国内 Coding Plan 端点 */
  DASHSCOPE_CODING: "dashscope-coding",
  /** 国际 Coding Plan 端点 */
  DASHSCOPE_CODING_INTL: "dashscope-coding-intl",
} as const;

type DashscopeProviderIdType = (typeof DashscopeProviderId)[keyof typeof DashscopeProviderId];

const DEFAULT_MODEL = "qwen3.5-plus";

type OpenAIModelInfo = {
  id: string;
  object: string;
  created: string;
  owned_by: string;
};

// Dashscope API 响应模型详细信息类型定义
type DashscopeModelInfo = {
  model: string;
  name: string;
  features: string[];
  inference_metadata: {
    response_modality: string[];
    request_modality: string[];
  };
  model_info: {
    context_window: number;
    max_input_tokens: number;
    max_output_tokens: number;
    max_reasoning_tokens?: number;
    reasoning_max_input_tokens?: number;
    reasoning_max_output_tokens?: number;
  };
};

type DashscopeModelsResponse = {
  code: string | null;
  message: string | null;
  success: boolean;
  output: {
    total: number;
    page_no: number;
    page_size: number;
    models: DashscopeModelInfo[];
  };
  request_id: string;
};

// ModelDefinition 类型定义（从 plugin-sdk 导入的类型）
type ModelDefinition = {
  id: string;
  name: string;
  api: "openai-completions";
  reasoning: boolean;
  input: Array<"text" | "image">;
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;
  maxTokens: number;
};

/**
 * Coding Plan 内置模型列表（直接使用 ModelDefinition 格式）
 * 由于 Coding Plan endpoint 不提供模型列表 API，这里硬编码支持的模型
 */
const CODING_PLAN_MODELS: ModelDefinition[] = [
  {
    id: "qwen3.5-plus",
    name: "Qwen3.5-Plus",
    api: "openai-completions",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1000000,
    maxTokens: 65536,
  },
  {
    id: "qwen3-max-2026-01-23",
    name: "Qwen3-Max-2026-01-23",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 262144,
    maxTokens: 65536,
  },
  {
    id: "qwen3-coder-next",
    name: "Qwen3-Coder-Next",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 262144,
    maxTokens: 65536,
  },
  {
    id: "qwen3-coder-plus",
    name: "Qwen3-Coder-Plus",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1000000,
    maxTokens: 65536,
  },
  {
    id: "MiniMax-M2.5",
    name: "MiniMax-M2.5",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 1000000,
    maxTokens: 65536,
  },
  {
    id: "glm-5",
    name: "GLM-5",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 202752,
    maxTokens: 16384,
  },
  {
    id: "glm-4.7",
    name: "GLM-4.7",
    api: "openai-completions",
    reasoning: false,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 202752,
    maxTokens: 16384,
  },
  {
    id: "kimi-k2.5",
    name: "Kimi-K2.5",
    api: "openai-completions",
    reasoning: false,
    input: ["text", "image"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 262144,
    maxTokens: 32768,
  },
];

/**
 * 基于 Dashscope Endpoint 构造 OpenAI Completions baseUrl
 * - Coding endpoint:
 *  - https://coding.dashscope.aliyuncs.com/v1（国内）dashscope-coding
 *  - https://coding-intl.dashscope.aliyuncs.com/v1（国际）dashscope-coding-intl
 * - Standard endpoint:
 *  - https://dashscope.aliyuncs.com/compatible-mode/v1 (国内) dashscope
 *  - https://dashscope-intl.aliyuncs.com/compatible-mode/v1（国际）dashscope-intl
 *  - https://dashscope-us.aliyuncs.com/compatible-mode/v1（美国）dashscope-us
 */

function isCodingPlanProvider(url: string): boolean {
  switch (getProviderIdFromEndpoint(url)) {
    case DashscopeProviderId.DASHSCOPE_CODING:
    case DashscopeProviderId.DASHSCOPE_CODING_INTL:
      return true;
  }

  return false;
}

function isDashscopeUSProvider(url: string): boolean {
  switch (getProviderIdFromEndpoint(url)) {
    case DashscopeProviderId.DASHSCOPE_US:
      return true;
  }

  return false;
}

/**
 * 根据 Dashscope endpoint origin 返回对应的 provider ID
 * @param url - endpoint origin URL (e.g., https://dashscope.aliyuncs.com)
 * @returns provider ID (e.g., dashscope, dashscope-coding, etc.)
 */
function getProviderIdFromEndpoint(url: string): DashscopeProviderIdType {
  const normalized = url.toLowerCase().trim();

  // Coding Plan endpoints
  if (normalized.includes("coding-intl.dashscope.aliyuncs.com")) {
    return DashscopeProviderId.DASHSCOPE_CODING_INTL;
  }
  if (normalized.includes("coding.dashscope.aliyuncs.com")) {
    return DashscopeProviderId.DASHSCOPE_CODING;
  }

  // Standard endpoints
  if (normalized.includes("dashscope-intl.aliyuncs.com")) {
    return DashscopeProviderId.DASHSCOPE_INTL;
  }
  if (normalized.includes("dashscope-us.aliyuncs.com")) {
    return DashscopeProviderId.DASHSCOPE_US;
  }
  if (normalized.includes("dashscope.aliyuncs.com")) {
    return DashscopeProviderId.DASHSCOPE;
  }

  throw Error(`Not support dashscope provider for endpoint: ${url}`);
}

/**
 * 将 Dashscope 模型信息转换为 OpenClaw ModelDefinition
 */
function buildModelDefinition(modelInfo: DashscopeModelInfo) {
  const requestModality = modelInfo.inference_metadata.request_modality || [];
  const input: Array<"text" | "image"> = [];

  if (requestModality.includes("Text")) {
    input.push("text");
  }
  if (requestModality.includes("Image")) {
    input.push("image");
  }

  // 如果没有识别到任何模态，默认支持文本
  if (input.length === 0) {
    input.push("text");
  }

  // 检查是否是推理模型（根据 features 列表）
  const reasoning = modelInfo.features?.includes("reasoning") || false;

  return {
    id: modelInfo.model,
    name: modelInfo.name || modelInfo.model,
    api: "openai-completions" as const,
    reasoning,
    input,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: modelInfo.model_info.context_window || 8192,
    maxTokens: modelInfo.model_info.max_output_tokens || 2048,
  };
}

function buildModelDefinitionFromOpenAI(modelsInfo: OpenAIModelInfo) {
  const modelId = modelsInfo.id;
  const modelName = modelsInfo.id;

  const supportsVisionModels = [DEFAULT_MODEL, "kimi/kimi-k2.5"]

  // Determine if the model supports vision based on name or capabilities
  let supportsVision =
    modelId.toLowerCase().includes("vision") || modelId.toLowerCase().includes("vl");

  if (supportsVisionModels.includes(modelId)) {
    supportsVision = true;
  }

  const input: ("text" | "image")[] = supportsVision ? ["text", "image"] : ["text"];

  return {
    id: modelId,
    name: modelName,
    api: "openai-completions" as const,
    reasoning: modelId.toLowerCase().includes("reasoning"),
    input,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 32768, // Typical for modern models, can be overridden
    maxTokens: 8192, // Typical for modern models, can be overridden
  };
}

/**
 * 调用 Dashscope API 验证模型并获取详细信息
 */
async function verifyModelAndGetModelDefinition(params: {
  baseUrl: string;
  apiKey: string;
  modelId: string;
}): Promise<ModelDefinition> {
  // Coding Plan endpoint 使用内置模型列表（已经是 ModelDefinition 格式）
  if (isCodingPlanProvider(params.baseUrl)) {
    const matchedModel = CODING_PLAN_MODELS.find((m) => m.id === params.modelId);
    if (!matchedModel) {
      const availableModels = CODING_PLAN_MODELS.map((m) => m.id).join(", ");
      throw new Error(
        `Model ${params.modelId} is not supported in Coding Plan. Available models: ${availableModels}`,
      );
    }
    return matchedModel;
  }

  if (isDashscopeUSProvider(params.baseUrl)) {
    const url = `${params.baseUrl}/compatible-mode/v1/models/${encodeURIComponent(params.modelId)}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${params.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `Failed to verify model from Dashscope US endpoint: HTTP ${response.status} ${response.statusText}` +
            (errorText ? ` - ${errorText}` : ""),
        );
      }

      const modelInfo = (await response.json()) as OpenAIModelInfo;

      if (!modelInfo.id) {
        throw new Error(`Invalid model response from Dashscope US endpoint: missing model id`);
      }

      return buildModelDefinitionFromOpenAI(modelInfo);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Failed to verify model")) {
        throw err;
      }
      throw new Error(
        `Failed to fetch model info from Dashscope US endpoint: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // Standard endpoint 调用 API 获取模型信息
  const url = `${params.baseUrl}/api/v1/models?page_no=1&page_size=100&name=${encodeURIComponent(params.modelId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to verify model: HTTP ${response.status} ${response.statusText}`);
  }

  const data: DashscopeModelsResponse = await response.json();

  if (!data.success || !data.output?.models?.length) {
    throw new Error(
      `Model ${params.modelId} not found or API returned error: ${data.message || "Unknown error"}`,
    );
  }

  // 遍历模型列表，精确匹配 modelId
  const matchedModel = data.output.models.find((model) => model.model === params.modelId);

  if (!matchedModel) {
    throw new Error(
      `Model ${params.modelId} not found in the response. Available models: ${data.output.models.map((m) => m.model).join(", ")}`,
    );
  }

  return buildModelDefinition(matchedModel);
}

/**
 * 创建模型引用（provider/model 格式）
 */
function modelRef(provider: string, modelId: string): string {
  return `${provider}/${modelId}`;
}

/**
 * 从配置中解析当前 primary model 的 providerId
 */
function parseProviderIdFromConfig(cfg: any): { providerId: string; error?: string } {
  const existingDefaults = (cfg.agents?.defaults ?? {}) as any;
  const existingModelConfig = existingDefaults.model as any | undefined;
  const currentPrimary =
    typeof existingModelConfig === "string" ? existingModelConfig : existingModelConfig?.primary;

  if (!currentPrimary || typeof currentPrimary !== "string") {
    return { providerId: "", error: "No primary model configured. Cannot auto-detect provider." };
  }

  const slashIndex = currentPrimary.indexOf("/");
  if (slashIndex === -1) {
    return { providerId: "", error: `Invalid primary model format: ${currentPrimary}` };
  }

  return { providerId: currentPrimary.substring(0, slashIndex).trim() };
}

/**
 * 验证 providerId 是否为有效的 Dashscope provider
 */
function validateDashscopeProvider(providerId: string): boolean {
  const validProviderIds = Object.values(DashscopeProviderId);
  return validProviderIds.includes(providerId as DashscopeProviderIdType);
}

/**
 * 从配置中读取并验证 provider 配置
 */
function getProviderConfig(
  cfg: any,
  providerId: string,
): { provider: any; baseUrl: string; apiKey: string; error?: string } {
  const provider = (cfg.models?.providers?.[providerId] ?? {}) as any;

  if (!provider || !provider.baseUrl || !provider.apiKey) {
    return {
      provider: {},
      baseUrl: "",
      apiKey: "",
      error: `Dashscope provider ${providerId} is not configured. Run 'openclaw dashscope set-provider' first.`,
    };
  }

  return {
    provider,
    baseUrl: String(provider.baseUrl).trim(),
    apiKey: String(provider.apiKey).trim(),
  };
}

/**
 * 解析 API Key（优先级：CLI 参数 > 配置文件 > 环境变量）
 */
function resolveApiKey(cliApiKey?: string, providerApiKey?: string, envApiKey?: string): string {
  return (cliApiKey ?? providerApiKey ?? envApiKey ?? "").trim();
}

/**
 * Dashscope Provider 插件
 */
const dashscopeCfgPlugin = {
  id: "dashscope-cfg",
  name: "Dashscope Config",
  description: "CLI commands for Dashscope provider configuration",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    api.registerCli(
      ({ program, config, logger }) => {
        const dashscope = program.command("dashscope").description("Dashscope helper commands");

        // openclaw dashscope set-provider --endpoint <url> --api-key <key> --model <modelId>
        dashscope
          .command("set-provider")
          .description("Configure Dashscope provider (baseUrl, apiKey, and initial model)")
          .option("--endpoint <url>", "Dashscope endpoint URL")
          .option("--api-key <key>", "Dashscope API Key")
          .option("--model <modelId>", "Initial model ID to configure", DEFAULT_MODEL)
          .action(async (opts: { endpoint?: string; apiKey?: string; model?: string }) => {
            const endpoint = (opts.endpoint ?? "").trim();
            const apiKey = (opts.apiKey ?? process.env.DASHSCOPE_API_KEY ?? "").trim();
            const modelId = (opts.model ?? DEFAULT_MODEL).trim();

            if (!endpoint) {
              logger.error("Missing required --endpoint parameter.");
              // eslint-disable-next-line no-console
              console.error(
                "Usage: openclaw dashscope set-provider --endpoint <url> --api-key <key> [--model <modelId>]",
              );
              process.exitCode = 1;
              return;
            }

            if (!apiKey) {
              logger.error("Missing required --api-key parameter or DASHSCOPE_API_KEY env var.");
              // eslint-disable-next-line no-console
              console.error(
                "Usage: openclaw dashscope set-provider --endpoint <url> --api-key <key> [--model <modelId>]",
              );
              process.exitCode = 1;
              return;
            }

            let baseUrl: string;
            try {
              baseUrl = new URL(endpoint).origin;
            } catch {
              logger.error(`Invalid endpoint URL: ${endpoint}`);
              // eslint-disable-next-line no-console
              console.error(`Invalid endpoint URL: ${endpoint}`);
              process.exitCode = 1;
              return;
            }

            let providerId: DashscopeProviderIdType;
            try {
              providerId = getProviderIdFromEndpoint(baseUrl);
            } catch (error) {
              logger.error(`Not support dashscope endpoint URL: ${endpoint}`);
              // eslint-disable-next-line no-console
              console.error(`Not support dashscope endpoint URL: ${endpoint}`);
              process.exitCode = 1;
              return;
            }

            logger.info("Verifying model and fetching details...");

            try {
              const modelDefinition = await verifyModelAndGetModelDefinition({
                baseUrl: baseUrl,
                apiKey: apiKey,
                modelId: modelId,
              });

              const currentCfg = api.runtime.config.loadConfig() as any;
              const existingProviders = (currentCfg.models?.providers ?? {}) as Record<string, any>;
              const existingProvider = (existingProviders[providerId] ?? {}) as any;
              const existingModels: any[] = Array.isArray(existingProvider.models)
                ? existingProvider.models
                : [];

              const mergedModels = [
                ...existingModels.filter(
                  (m) => m && typeof m === "object" && m.id !== modelDefinition.id,
                ),
                modelDefinition,
              ];

              const nextProvider = {
                ...existingProvider,
                baseUrl: isCodingPlanProvider(baseUrl)
                  ? `${baseUrl}/v1`
                  : `${baseUrl}/compatible-mode/v1`,
                api: "openai-completions" as const,
                apiKey,
                models: mergedModels,
              };

              const existingDefaults = (currentCfg.agents?.defaults ?? {}) as any;
              const existingAgentModels = (existingDefaults.models ?? {}) as Record<string, any>;
              const modelRefId = modelRef(providerId, modelDefinition.id);

              const nextAgentModels: Record<string, any> = {
                ...existingAgentModels,
                [modelRefId]: {
                  ...(existingAgentModels[modelRefId] ?? {}),
                  alias: modelDefinition.name.toLowerCase().replace(/\s+/g, "-"),
                },
              };

              const existingModelConfig = existingDefaults.model as any | undefined;
              // 提取现有的 fallbacks（兼容字符串和对象两种格式）
              const existingFallbacks =
                existingModelConfig &&
                typeof existingModelConfig === "object" &&
                Array.isArray(existingModelConfig.fallbacks)
                  ? existingModelConfig.fallbacks
                  : [];

              const nextDefaultModel = {
                primary: modelRefId,
                ...(existingFallbacks.length > 0 ? { fallbacks: existingFallbacks } : {}),
              };

              const nextCfg = {
                ...currentCfg,
                models: {
                  ...(currentCfg.models ?? {}),
                  providers: {
                    ...((currentCfg.models?.providers ?? {}) as Record<string, any>),
                    [providerId]: nextProvider,
                  },
                },
                agents: {
                  ...(currentCfg.agents ?? {}),
                  defaults: {
                    ...existingDefaults,
                    models: nextAgentModels,
                    model: nextDefaultModel,
                  },
                },
              };

              await api.runtime.config.writeConfigFile(nextCfg);
              logger.info("Dashscope provider configured successfully.");
              // eslint-disable-next-line no-console
              console.log(`Dashscope provider configured successfully.`);
              // eslint-disable-next-line no-console
              console.log(`  Endpoint: ${endpoint}`);
              // eslint-disable-next-line no-console
              console.log(`  Model: ${modelDefinition.name} (${modelDefinition.id})`);
              // eslint-disable-next-line no-console
              console.log(`  Context window: ${modelDefinition.contextWindow} tokens`);
              // eslint-disable-next-line no-console
              console.log(`  Max output tokens: ${modelDefinition.maxTokens}`);
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              logger.error(`dashscope set-provider failed: ${msg}`);
              // eslint-disable-next-line no-console
              console.error(`dashscope set-provider failed: ${msg}`);
              process.exitCode = 1;
            }
          });

        // openclaw dashscope show-provider --json
        dashscope
          .command("show-provider")
          .description("Show Dashscope provider config and models")
          .option("--json", "Output JSON", false)
          .action(async (opts: { json?: boolean }) => {
            const cfg = config as any;

            // 解析 providerId
            const parseResult = parseProviderIdFromConfig(cfg);
            if (parseResult.error) {
              logger.error(parseResult.error);
              // eslint-disable-next-line no-console
              console.error(
                parseResult.error.includes("Cannot auto-detect")
                  ? "No primary model configured. Please configure a primary model first."
                  : parseResult.error,
              );
              process.exitCode = 1;
              return;
            }

            const { providerId } = parseResult;

            // 验证是否为 Dashscope provider
            if (!validateDashscopeProvider(providerId)) {
              logger.error(`Current provider ${providerId} is not a Dashscope provider.`);
              // eslint-disable-next-line no-console
              console.error(`Current provider ${providerId} is not a Dashscope provider.`);
              process.exitCode = 1;
              return;
            }

            // 读取 provider 配置
            const provider = (cfg.models?.providers?.[providerId] ?? {}) as any;
            if (!provider || Object.keys(provider).length === 0) {
              logger.warn(`Dashscope provider ${providerId} is not configured yet.`);
              // eslint-disable-next-line no-console
              console.error(
                `Dashscope provider ${providerId} is not configured yet. Run 'openclaw dashscope set-provider' first.`,
              );
              process.exitCode = 1;
              return;
            }

            if (opts.json) {
              // eslint-disable-next-line no-console
              console.log(JSON.stringify(provider, null, 2));
              return;
            }

            const models: any[] = Array.isArray(provider.models) ? provider.models : [];
            const modelIds = models
              .map((m: any) => (m && typeof m === "object" ? String(m.id ?? "").trim() : ""))
              .filter((id: string) => id);

            // eslint-disable-next-line no-console
            console.log(`Dashscope Provider ID: ${providerId}`);
            // eslint-disable-next-line no-console
            console.log(`Dashscope baseUrl: ${String(provider.baseUrl ?? "")}`);
            // eslint-disable-next-line no-console
            console.log(`Dashscope apiKey: ${provider.apiKey ? "[set]" : "[not set]"}`);
            // eslint-disable-next-line no-console
            console.log(
              `Dashscope models: ${modelIds.length > 0 ? modelIds.join(", ") : "(none)"}`,
            );
          });

        // openclaw dashscope set-model --model <modelId>
        dashscope
          .command("set-model")
          .description("Set a different model within the current Dashscope provider")
          .option("--model <modelId>", "Model ID to set")
          .action(async (opts: { model?: string }) => {
            const modelId = (opts.model ?? "").trim();

            if (!modelId) {
              logger.error("Missing required --model parameter.");
              // eslint-disable-next-line no-console
              console.error("Usage: openclaw dashscope set-model --model <modelId>");
              process.exitCode = 1;
              return;
            }

            const currentCfg = api.runtime.config.loadConfig() as any;

            // 解析 providerId
            const parseResult = parseProviderIdFromConfig(currentCfg);
            if (parseResult.error) {
              logger.error(parseResult.error);
              // eslint-disable-next-line no-console
              console.error(
                "No primary model configured. Run 'openclaw dashscope set-provider' first.",
              );
              process.exitCode = 1;
              return;
            }

            const { providerId } = parseResult;

            // 验证是否为 Dashscope provider
            if (!validateDashscopeProvider(providerId)) {
              logger.error(`Current provider ${providerId} is not a Dashscope provider.`);
              // eslint-disable-next-line no-console
              console.error(
                `Current provider ${providerId} is not a Dashscope provider. Use 'openclaw dashscope set-provider' to configure a Dashscope provider first.`,
              );
              process.exitCode = 1;
              return;
            }

            // 读取 provider 配置
            const providerResult = getProviderConfig(currentCfg, providerId);
            if (providerResult.error) {
              logger.error(providerResult.error);
              // eslint-disable-next-line no-console
              console.error(providerResult.error);
              process.exitCode = 1;
              return;
            }

            const { provider, baseUrl, apiKey } = providerResult;
            const existingModels: any[] = Array.isArray(provider.models) ? provider.models : [];

            // 检查模型是否已存在于 provider.models 列表中
            const existingModel = existingModels.find(
              (m) => m && typeof m === "object" && String(m.id ?? "").trim() === modelId,
            );

            let modelDefinition: ModelDefinition;

            if (existingModel) {
              // 模型已存在，直接使用
              modelDefinition = existingModel as ModelDefinition;
              logger.info(`Model ${modelId} already exists in provider ${providerId}.`);
            } else {
              // 模型不存在，调用 API 获取模型详情
              logger.info(`Fetching model ${modelId} details from provider ${providerId}...`);

              try {
                const originUrl = new URL(baseUrl).origin;
                modelDefinition = await verifyModelAndGetModelDefinition({
                  baseUrl: originUrl,
                  apiKey,
                  modelId,
                });

                // 追加到 provider.models 列表
                const mergedModels = [
                  ...existingModels.filter(
                    (m) => m && typeof m === "object" && m.id !== modelDefinition.id,
                  ),
                  modelDefinition,
                ];

                const nextProvider = {
                  ...provider,
                  models: mergedModels,
                };

                // 更新 provider 配置
                const nextProviders = {
                  ...((currentCfg.models?.providers ?? {}) as Record<string, any>),
                  [providerId]: nextProvider,
                };

                currentCfg.models = {
                  ...(currentCfg.models ?? {}),
                  providers: nextProviders,
                };
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.error(`Failed to fetch model ${modelId}: ${msg}`);
                // eslint-disable-next-line no-console
                console.error(`Failed to fetch model ${modelId}: ${msg}`);
                process.exitCode = 1;
                return;
              }
            }

            // 更新 agents.defaults.model 和 agents.defaults.models
            const existingDefaults = (currentCfg.agents?.defaults ?? {}) as any;
            const existingAgentModels = (existingDefaults.models ?? {}) as Record<string, any>;
            const modelRefId = modelRef(providerId, modelDefinition.id);

            const nextAgentModels: Record<string, any> = {
              ...existingAgentModels,
              [modelRefId]: {
                ...(existingAgentModels[modelRefId] ?? {}),
                alias: modelDefinition.name.toLowerCase().replace(/\s+/g, "-"),
              },
            };

            // 保持现有 fallbacks，只更新 primary
            const existingModelConfig = existingDefaults.model as any | undefined;
            const existingFallbacks =
              existingModelConfig &&
              typeof existingModelConfig === "object" &&
              Array.isArray(existingModelConfig.fallbacks)
                ? existingModelConfig.fallbacks
                : [];

            const nextDefaultModel = {
              primary: modelRefId,
              ...(existingFallbacks.length > 0 ? { fallbacks: existingFallbacks } : {}),
            };

            const nextCfg = {
              ...currentCfg,
              agents: {
                ...(currentCfg.agents ?? {}),
                defaults: {
                  ...existingDefaults,
                  models: nextAgentModels,
                  model: nextDefaultModel,
                },
              },
            };

            await api.runtime.config.writeConfigFile(nextCfg);
            logger.info(`Dashscope model set to ${modelRefId} successfully.`);
            // eslint-disable-next-line no-console
            console.log(`Dashscope model set successfully.`);
            // eslint-disable-next-line no-console
            console.log(`  Provider: ${providerId}`);
            // eslint-disable-next-line no-console
            console.log(`  Model: ${modelDefinition.name} (${modelDefinition.id})`);
            // eslint-disable-next-line no-console
            console.log(`  Context window: ${modelDefinition.contextWindow} tokens`);
            // eslint-disable-next-line no-console
            console.log(`  Max output tokens: ${modelDefinition.maxTokens}`);
          });

        dashscope
          .command("verify-model")
          .description("Verify a Dashscope model and show details")
          .argument("<modelId>", "Model id to verify")
          .option("--endpoint <url>", "Dashscope endpoint URL")
          .option("--api-key <key>", "Dashscope API key")
          .action(
            async (
              modelId: string,
              opts: {
                endpoint?: string;
                apiKey?: string;
              },
            ) => {
              const cfg = config as any;

              let providerId: DashscopeProviderIdType | undefined;
              let baseUrl: string;
              let apiKey: string;

              if (opts.endpoint) {
                // 使用用户指定的 endpoint
                try {
                  baseUrl = new URL(opts.endpoint).origin;
                  providerId = getProviderIdFromEndpoint(baseUrl);
                } catch (error) {
                  logger.error(`Invalid or unsupported endpoint URL: ${opts.endpoint}`);
                  // eslint-disable-next-line no-console
                  console.error(`Invalid or unsupported endpoint URL: ${opts.endpoint}`);
                  process.exitCode = 1;
                  return;
                }

                // API Key 优先级: CLI 参数 > 环境变量
                apiKey = resolveApiKey(opts.apiKey, undefined, process.env.DASHSCOPE_API_KEY);

                if (!apiKey) {
                  logger.error("No API key provided.");
                  // eslint-disable-next-line no-console
                  console.error(
                    "Provide an API key via --api-key option or DASHSCOPE_API_KEY env var.",
                  );
                  process.exitCode = 1;
                  return;
                }
              } else {
                // 从当前 primary model 解析 providerId
                const parseResult = parseProviderIdFromConfig(cfg);
                if (parseResult.error) {
                  logger.error(parseResult.error);
                  // eslint-disable-next-line no-console
                  console.error(
                    "No primary model configured. Use --endpoint option or configure a primary model first.",
                  );
                  process.exitCode = 1;
                  return;
                }

                providerId = parseResult.providerId as DashscopeProviderIdType;

                // 验证是否为 Dashscope provider
                if (!validateDashscopeProvider(providerId)) {
                  logger.error(`Current provider ${providerId} is not a Dashscope provider.`);
                  // eslint-disable-next-line no-console
                  console.error(`Current provider ${providerId} is not a Dashscope provider.`);
                  process.exitCode = 1;
                  return;
                }

                // 读取 provider 配置
                const providerResult = getProviderConfig(cfg, providerId);
                if (providerResult.error) {
                  logger.error(providerResult.error);
                  // eslint-disable-next-line no-console
                  console.error(
                    `Dashscope provider ${providerId} is not configured. Use --endpoint and --api-key options, or configure the provider first.`,
                  );
                  process.exitCode = 1;
                  return;
                }

                baseUrl = new URL(providerResult.baseUrl).origin;

                // API Key 优先级: CLI 参数 > 配置文件 > 环境变量
                apiKey = resolveApiKey(
                  opts.apiKey,
                  providerResult.apiKey,
                  process.env.DASHSCOPE_API_KEY,
                );

                if (!apiKey) {
                  logger.error("No API key available.");
                  // eslint-disable-next-line no-console
                  console.error(
                    "Provide an API key via --api-key option, configured provider, or DASHSCOPE_API_KEY env var.",
                  );
                  process.exitCode = 1;
                  return;
                }
              }

              try {
                const modelDef = await verifyModelAndGetModelDefinition({
                  baseUrl,
                  apiKey,
                  modelId: modelId.trim(),
                });

                // eslint-disable-next-line no-console
                console.log(
                  JSON.stringify(
                    {
                      providerId,
                      id: modelDef.id,
                      name: modelDef.name,
                      api: modelDef.api,
                      reasoning: modelDef.reasoning,
                      input: modelDef.input,
                      contextWindow: modelDef.contextWindow,
                      maxTokens: modelDef.maxTokens,
                    },
                    null,
                    2,
                  ),
                );
              } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                logger.error(`dashscope verify-model failed: ${msg}`);
                // eslint-disable-next-line no-console
                console.error(`dashscope verify-model failed: ${msg}`);
                process.exitCode = 1;
              }
            },
          );
      },
      { commands: ["dashscope"] },
    );
  },
};

export default dashscopeCfgPlugin;
