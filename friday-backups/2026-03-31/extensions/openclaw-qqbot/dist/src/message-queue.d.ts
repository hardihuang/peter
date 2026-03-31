import type { QueueSnapshot } from "./slash-commands.js";
/**
 * 消息队列项类型（用于异步处理消息，防止阻塞心跳）
 */
export interface QueuedMessage {
    type: "c2c" | "guild" | "dm" | "group";
    senderId: string;
    senderName?: string;
    content: string;
    messageId: string;
    timestamp: string;
    channelId?: string;
    guildId?: string;
    groupOpenid?: string;
    attachments?: Array<{
        content_type: string;
        url: string;
        filename?: string;
        voice_wav_url?: string;
        asr_refer_text?: string;
    }>;
    /** 被引用消息的 refIdx（用户引用了哪条历史消息） */
    refMsgIdx?: string;
    /** 当前消息自身的 refIdx（供将来被引用） */
    msgIdx?: string;
}
export interface MessageQueueContext {
    accountId: string;
    log?: {
        info: (msg: string) => void;
        error: (msg: string) => void;
        debug?: (msg: string) => void;
    };
    /** 外部提供的 abort 状态检查 */
    isAborted: () => boolean;
}
export interface MessageQueue {
    enqueue: (msg: QueuedMessage) => void;
    startProcessor: (handleMessageFn: (msg: QueuedMessage) => Promise<void>) => void;
    getSnapshot: (senderPeerId: string) => QueueSnapshot;
    getMessagePeerId: (msg: QueuedMessage) => string;
    /** 清空指定用户的排队消息，返回被丢弃的消息数 */
    clearUserQueue: (peerId: string) => number;
    /** 立即执行一条消息（绕过队列），用于紧急命令 */
    executeImmediate: (msg: QueuedMessage) => void;
}
/**
 * 创建按用户并发的消息队列（同用户串行，跨用户并行）
 */
export declare function createMessageQueue(ctx: MessageQueueContext): MessageQueue;
