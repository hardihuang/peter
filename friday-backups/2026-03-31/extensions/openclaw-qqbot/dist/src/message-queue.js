// 消息队列配置
const MESSAGE_QUEUE_SIZE = 1000;
const PER_USER_QUEUE_SIZE = 20;
const MAX_CONCURRENT_USERS = 10;
/**
 * 创建按用户并发的消息队列（同用户串行，跨用户并行）
 */
export function createMessageQueue(ctx) {
    const { accountId, log } = ctx;
    const userQueues = new Map();
    const activeUsers = new Set();
    let messagesProcessed = 0;
    let handleMessageFnRef = null;
    let totalEnqueued = 0;
    const getMessagePeerId = (msg) => {
        if (msg.type === "guild")
            return `guild:${msg.channelId ?? "unknown"}`;
        if (msg.type === "group")
            return `group:${msg.groupOpenid ?? "unknown"}`;
        return `dm:${msg.senderId}`;
    };
    const drainUserQueue = async (peerId) => {
        if (activeUsers.has(peerId))
            return;
        if (activeUsers.size >= MAX_CONCURRENT_USERS) {
            log?.info(`[qqbot:${accountId}] Max concurrent users (${MAX_CONCURRENT_USERS}) reached, ${peerId} will wait`);
            return;
        }
        const queue = userQueues.get(peerId);
        if (!queue || queue.length === 0) {
            userQueues.delete(peerId);
            return;
        }
        activeUsers.add(peerId);
        try {
            while (queue.length > 0 && !ctx.isAborted()) {
                const msg = queue.shift();
                totalEnqueued = Math.max(0, totalEnqueued - 1);
                try {
                    if (handleMessageFnRef) {
                        await handleMessageFnRef(msg);
                        messagesProcessed++;
                    }
                }
                catch (err) {
                    log?.error(`[qqbot:${accountId}] Message processor error for ${peerId}: ${err}`);
                }
            }
        }
        finally {
            activeUsers.delete(peerId);
            userQueues.delete(peerId);
            for (const [waitingPeerId, waitingQueue] of userQueues) {
                if (activeUsers.size >= MAX_CONCURRENT_USERS)
                    break;
                if (waitingQueue.length > 0 && !activeUsers.has(waitingPeerId)) {
                    drainUserQueue(waitingPeerId);
                }
            }
        }
    };
    const enqueue = (msg) => {
        const peerId = getMessagePeerId(msg);
        let queue = userQueues.get(peerId);
        if (!queue) {
            queue = [];
            userQueues.set(peerId, queue);
        }
        if (queue.length >= PER_USER_QUEUE_SIZE) {
            const dropped = queue.shift();
            log?.error(`[qqbot:${accountId}] Per-user queue full for ${peerId}, dropping oldest message ${dropped?.messageId}`);
        }
        totalEnqueued++;
        if (totalEnqueued > MESSAGE_QUEUE_SIZE) {
            log?.error(`[qqbot:${accountId}] Global queue limit reached (${totalEnqueued}), message from ${peerId} may be delayed`);
        }
        queue.push(msg);
        log?.debug?.(`[qqbot:${accountId}] Message enqueued for ${peerId}, user queue: ${queue.length}, active users: ${activeUsers.size}`);
        drainUserQueue(peerId);
    };
    const startProcessor = (handleMessageFn) => {
        handleMessageFnRef = handleMessageFn;
        log?.info(`[qqbot:${accountId}] Message processor started (per-user concurrency, max ${MAX_CONCURRENT_USERS} users)`);
    };
    const getSnapshot = (senderPeerId) => {
        let totalPending = 0;
        for (const [, q] of userQueues) {
            totalPending += q.length;
        }
        const senderQueue = userQueues.get(senderPeerId);
        return {
            totalPending,
            activeUsers: activeUsers.size,
            maxConcurrentUsers: MAX_CONCURRENT_USERS,
            senderPending: senderQueue ? senderQueue.length : 0,
        };
    };
    const clearUserQueue = (peerId) => {
        const queue = userQueues.get(peerId);
        if (!queue || queue.length === 0)
            return 0;
        const droppedCount = queue.length;
        queue.length = 0;
        totalEnqueued = Math.max(0, totalEnqueued - droppedCount);
        return droppedCount;
    };
    const executeImmediate = (msg) => {
        if (handleMessageFnRef) {
            handleMessageFnRef(msg).catch(err => {
                log?.error(`[qqbot:${accountId}] Immediate execution error: ${err}`);
            });
        }
    };
    return { enqueue, startProcessor, getSnapshot, getMessagePeerId, clearUserQueue, executeImmediate };
}
