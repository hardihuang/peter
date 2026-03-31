/**
 * 管理员解析器模块
 * - 管理员 openid 持久化读写
 * - 升级问候目标读写
 * - 启动问候语发送
 */
export interface AdminResolverContext {
    accountId: string;
    appId: string;
    clientSecret: string;
    log?: {
        info: (msg: string) => void;
        error: (msg: string) => void;
    };
}
export declare function loadAdminOpenId(accountId: string): string | undefined;
export declare function saveAdminOpenId(accountId: string, openid: string): void;
export declare function loadUpgradeGreetingTargetOpenId(accountId: string, appId: string): string | undefined;
export declare function clearUpgradeGreetingTargetOpenId(accountId: string, appId: string): void;
/**
 * 解析管理员 openid：
 * 1. 优先读持久化文件（稳定）
 * 2. fallback 取第一个私聊用户，并写入文件锁定
 */
export declare function resolveAdminOpenId(ctx: Pick<AdminResolverContext, "accountId" | "log">): string | undefined;
/** 异步发送启动问候语（仅发给管理员） */
export declare function sendStartupGreetings(ctx: AdminResolverContext, trigger: "READY" | "RESUMED"): void;
