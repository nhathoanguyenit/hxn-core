// plugins/socket-sdk/socket-sdk.js
// Universal Socket SDK – multi-instance safe
// Supports NestJS Gateways and Socket.IO servers
// Works in Browser and Node.js

(function (global, factory) {
    if (typeof module !== "undefined" && typeof exports !== "undefined") {
        module.exports = factory(require("socket.io-client"));
    } else {
        global.SocketSDK = factory(global.io);
    }
})(typeof window !== "undefined" ? window : this, function (io) {
    if (!io) throw new Error("socket.io-client is required.");

    class SocketSDK {
        /**
         * @param {string} url - Socket.IO server endpoint (e.g. "/", "/chat", "http://localhost:4200/chat")
         * @param {object} opts - Socket.IO connection options
         */
        constructor(url = "/", opts = {}) {
            this.url = url;
            this.opts = Object.assign(
                {
                    autoConnect: true,
                    reconnection: true,
                    withCredentials: true,
                    reconnectionAttempts: Infinity,
                    reconnectionDelay: 1000,
                    transports: ["websocket"],
                },
                opts
            );

            this.socket = null;
            this._listeners = new Map(); // event -> Set<callback>
            this._connectedOnce = false; // to prevent reattach duplicates
        }

        /** 🔌 Connect to socket server (instance-based) */
        connect() {
            if (this.socket && this.socket.connected) return Promise.resolve();

            // Always create a *new socket instance* (io() always returns per-namespace)
            this.socket = io(this.url, this.opts);

            this.socket.on("connect", () => {
                console.log(`✅ [${this.url}] connected:`, this.socket.id);

                // only reattach listeners if reconnected
                if (this._connectedOnce) {
                    this._listeners.forEach((callbacks, event) => {
                        callbacks.forEach((cb) => this.socket.on(event, cb));
                    });
                }
                this._connectedOnce = true;
            });

            this.socket.on("disconnect", (reason) => {
                console.warn(`⚠️ [${this.url}] disconnected:`, reason);
            });

            this.socket.on("connect_error", (err) => {
                console.error(`❌ [${this.url}] connection error:`, err.message);
            });

            return new Promise((resolve, reject) => {
                if (this.socket.connected) return resolve();

                const cleanup = () => {
                    this.socket.off("connect", onConnect);
                    this.socket.off("connect_error", onError);
                    this.socket.off("error", onError);
                };

                const onConnect = () => {
                    cleanup();
                    resolve();
                };

                const onError = (err) => {
                    cleanup();
                    reject(err || new Error("Socket connection failed"));
                };

                this.socket.once("connect", onConnect);
                this.socket.once("connect_error", onError);
                this.socket.once("error", onError);
            });
        }

        /** 📴 Disconnect this instance only */
        disconnect() {
            if (this.socket) {
                console.log(`🔌 [${this.url}] disconnecting...`);
                this.socket.disconnect();
                this.socket = null;
            }
        }

        /** 🎧 Add event listener (instance isolated) */
        on(event, callback) {
            if (!this._listeners.has(event)) this._listeners.set(event, new Set());
            const callbacks = this._listeners.get(event);
            if (!callbacks.has(callback)) {
                callbacks.add(callback);
                if (this.socket) this.socket.on(event, callback);
            }
        }

        /** ❌ Remove listener */
        off(event, callback) {
            if (this._listeners.has(event)) {
                const callbacks = this._listeners.get(event);
                callbacks.delete(callback);
                if (callbacks.size === 0) this._listeners.delete(event);
            }
            if (this.socket) this.socket.off(event, callback);
        }

        /** 🚀 Emit event with ACK (safe per instance) */
        emit(event, payload = {}, ackTimeoutMs = 5000, expectEvent = null) {
            return new Promise((resolve, reject) => {
                if (!this.socket || !this.socket.connected)
                    return reject(new Error(`Socket [${this.url}] not connected`));
                let settled = false;

                const timer = setTimeout(() => {
                    if (!settled) {
                        settled = true;
                        reject(new Error(`ACK timeout for "${event}" on ${this.url}`));
                    }
                }, ackTimeoutMs);

                try {
                    // built-in ack callback
                    this.socket.emit(event, payload, (ack) => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(timer);
                        resolve({
                            ok: ack?.ok ?? true,
                            message: ack?.message ?? "ack",
                            data: ack?.data ?? ack,
                        });
                    });

                    // optional fallback event
                    if (expectEvent) {
                        const onResp = (resp) => {
                            if (settled) return;
                            settled = true;
                            clearTimeout(timer);
                            this.off(expectEvent, onResp);
                            resolve({ ok: true, event: expectEvent, data: resp });
                        };
                        this.on(expectEvent, onResp);
                    }
                } catch (err) {
                    clearTimeout(timer);
                    reject(err);
                }
            });
        }

        /** 🧭 Request / Response pattern */
        request(event, payload = {}, expectEvent, timeoutMs = 5000) {
            if (!expectEvent) throw new Error("request() requires expectEvent argument");

            return new Promise((resolve, reject) => {
                if (!this.socket || !this.socket.connected)
                    return reject(new Error(`Socket [${this.url}] not connected`));

                const timer = setTimeout(() => {
                    this.off(expectEvent, onResponse);
                    reject(new Error(`Request timeout for "${expectEvent}"`));
                }, timeoutMs);

                const onResponse = (data) => {
                    clearTimeout(timer);
                    this.off(expectEvent, onResponse);
                    resolve(data);
                };

                this.on(expectEvent, onResponse);
                this.socket.emit(event, payload);
            });
        }
    }

    return SocketSDK;
});
