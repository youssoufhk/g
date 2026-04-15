/**
 * WebSocket singleton with reconnect.
 *
 * One connection per tab. Messages are tagged with (user_id, tenant_id) on
 * the server (ADR-004) so the client just routes by channel name to the
 * subscribed handlers.
 */

type Handler = (payload: unknown) => void;

export class RealtimeClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<Handler>>();
  private reconnectDelay = 1000;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.ws) return;
    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.ws.onmessage = (event) => this.dispatch(event.data);
    this.ws.onclose = () => {
      this.ws = null;
      this.scheduleReconnect();
    };
    this.ws.onopen = () => {
      this.reconnectDelay = 1000;
    };
  }

  subscribe(channel: string, handler: Handler): () => void {
    if (!this.handlers.has(channel)) this.handlers.set(channel, new Set());
    this.handlers.get(channel)!.add(handler);
    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  private dispatch(raw: unknown): void {
    try {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data && typeof data === "object" && "channel" in data) {
        const channel = (data as { channel: string }).channel;
        const payload = (data as { payload?: unknown }).payload;
        this.handlers.get(channel)?.forEach((handler) => handler(payload));
      }
    } catch {
      // swallow malformed frames; real impl logs via monitoring wrapper
    }
  }

  private scheduleReconnect(): void {
    const delay = Math.min(this.reconnectDelay, 30_000);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000);
    setTimeout(() => this.connect(), delay);
  }
}
