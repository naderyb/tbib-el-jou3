export type LogMeta = { route?: string; method?: string; status?: number; durationMs?: number; error?: any };

export const logger = {
  info: (msg: string, meta: LogMeta = {}) => {
    const out = { level: "info", time: new Date().toISOString(), msg, ...meta };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(out));
  },
  warn: (msg: string, meta: LogMeta = {}) => {
    const out = { level: "warn", time: new Date().toISOString(), msg, ...meta };
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(out));
  },
  error: (msg: string, meta: LogMeta = {}) => {
    const out = { level: "error", time: new Date().toISOString(), msg, ...meta };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(out));
  },
};

export function wrapHandler<T extends (...args: any[]) => Promise<any>>(handler: T, opts?: { route?: string }) {
  return async function wrapped(...args: Parameters<T>) {
    const start = Date.now();
    const method = (args[0] && (args[0] as Request).method) || "UNKNOWN";
    const route = opts?.route;
    logger.info("handler_start", { route, method });
    try {
      const result = await handler(...args);
      const durationMs = Date.now() - start;
      const status = (result && (result.status ?? (result.statusCode ?? undefined))) as number | undefined;
      logger.info("handler_end", { route, method, status, durationMs });
      return result;
    } catch (err) {
      const durationMs = Date.now() - start;
      logger.error("handler_exception", { route, method, durationMs, error: String(err) });
      throw err;
    }
  };
}
