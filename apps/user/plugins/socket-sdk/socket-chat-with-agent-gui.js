// plugins/socket-sdk/socket-chat-gui.js
(function (global) {
    if (!global.SocketSDK) {
        console.error("❌ socket-chat-gui.js requires socket-sdk.js to be loaded first.");
        return;
    }

    class SocketChatGUI {
        constructor(options = {}) {
            this.room = options.room || "general";
            this.username = options.username || `Guest_${Math.floor(Math.random() * 1000)}`;
            this.namespace = options.namespace || "/chat";
            this.id = `chat-${Math.floor(Math.random() * 1000000)}`;
            this.sdk = new global.SocketSDK(this.namespace, options);
            this.connected = false;
            this.visible = false;
            this.chatId = null;
            this.pendingMessages = new Set();

            this._createUI();
            this._bindUIEvents();
            this._connect();
        }

        _createUI() {
            this.toggleBtn = document.createElement("button");
            this.toggleBtn.id = `${this.id}-toggle`;
            Object.assign(this.toggleBtn.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: "22px",
                zIndex: 9999,
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
            });
            this.toggleBtn.textContent = "💬";
            document.body.appendChild(this.toggleBtn);

            // Chat Container
            this.container = document.createElement("div");
            this.container.id = this.id;
            Object.assign(this.container.style, {
                position: "fixed",
                bottom: "80px",
                right: "20px",
                width: "320px",
                height: "420px",
                background: "#1a1a1a",
                color: "#fff",
                borderRadius: "10px",
                border: "1px solid #333",
                display: "none",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: "Inter, sans-serif",
                zIndex: 10000,
            });

            this.container.innerHTML = `
                <div style="background:#222;padding:6px;text-align:center;font-weight:bold;">
                💬 Chat
                </div>
                <div id="${this.id}-messages" style="flex:1;overflow-y:auto;padding:8px;background:#111;"></div>
                <div style="display:flex;border-top:1px solid #333;">
                <input id="${this.id}-input" type="text"
                    placeholder="Type a message..."
                    style="flex:1;padding:8px;border:none;outline:none;background:#000;color:#fff;">
                <button id="${this.id}-send"
                    style="padding:8px 16px;border:none;background:#007bff;color:#fff;cursor:pointer;">Send</button>
                </div>
            `;
            document.body.appendChild(this.container);

            this.messagesEl = document.getElementById(`${this.id}-messages`);
            this.inputEl = document.getElementById(`${this.id}-input`);
            this.sendBtn = document.getElementById(`${this.id}-send`);
        }

        _bindUIEvents() {
            this.toggleBtn.addEventListener("click", () => this._toggle());
            this.sendBtn.addEventListener("click", () => this._send());
            this.inputEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter") this._send();
            });
        }

        _toggle() {
            this.visible = !this.visible;
            this.container.style.display = this.visible ? "flex" : "none";
            this.toggleBtn.style.background = this.visible ? "#dc3545" : "#007bff";
            this.toggleBtn.textContent = this.visible ? "✖" : "💬";
        }

        async _connect() {
            try {
                await this.sdk.connect();
                this.connected = true;
                this._log("Connected to Chat Gateway");

                // Listen for incoming messages
                this.sdk.on("joined_chat", (msg) => {
                    // TODO IMPLEMENT LOGIC
                });

                // Listen for incoming messages
                this.sdk.on("chat_message", (msg) => {
                    // TODO IMPLEMENT LOGIC
                });

                const joinAck = await this.sdk.emit("find_available_agent", {}, 3000);
                if (joinAck?.ok) {
                    this._log(`Connected to agent`);
                } else {
                    this._log(`⚠️ Failed to find agent: ${joinAck?.message}`);
                }
            } catch (err) {
                this._log(`❌ Connection failed: ${err.message}`);
            }
        }

        async _send() {
            // TODO IMPLEMENT LOGIC
            const ack = await this.sdk.emit("send_message", { chatId: this.chatId, message }, 5000);
        }

        _log(text) {
            const html = `<div style="text-align:center;color:#aaa;margin:4px 0;font-size:12px;">${text}</div>`;
            this.messagesEl.insertAdjacentHTML("beforeend", html);
            this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
        }
    }

    global.SocketChatGUI = SocketChatGUI;
})(typeof window !== "undefined" ? window : this);
