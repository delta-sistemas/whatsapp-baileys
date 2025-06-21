import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from 'fs/promises';
var QRCode = require('qrcode')

class WhatsAppService {
    private activeConnections: Map<string, ReturnType<typeof makeWASocket>> = new Map();
    private qrCallbacks: Map<string, (qr: string) => void> = new Map();

    public async closeConnection(statePath: string) {
        fs.rm(statePath, { recursive: true })
    }

    public async startConnection(uuid: string, qrCallback?: (qr: string) => void) {
        const statePath = `./states/${uuid}`;

        // Se um callback foi fornecido, armazena para este UUID
        if (qrCallback) {
            this.qrCallbacks.set(uuid, qrCallback);
        }

        try {
            const { state, saveCreds } = await useMultiFileAuthState(statePath);

            const sock = makeWASocket({
                auth: state,
                browser: Browsers.windows('opera'),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    // Emite o QR code via callback se existir
                    const callback = this.qrCallbacks.get(uuid);
                    if (callback) {
                        callback(qr);
                        // Remove o callback após emitir o QR code
                        this.qrCallbacks.delete(uuid);
                    }
                }             
                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`Connection closed for ${uuid}. Reconnecting: ${shouldReconnect}`);

                    if (shouldReconnect) {
                        this.startConnection(uuid);
                    } else {
                        this.stopConnection(uuid);
                    }
                } else if (connection === 'open') {
                    console.log(`Connection opened for ${uuid}`);
                }
            });

            sock.ev.on('messages.upsert', (m) => {
                // IMPLEMENTAR LOGICA DE ENVIO PARA API DE DADOS
                console.log(`Message from ${m.messages[0].key.remoteJid}: ${m.messages[0].message?.extendedTextMessage?.text}`);
            });

            this.activeConnections.set(uuid, sock);
            console.log(`Connection started for ${uuid}`);
        } catch (error) {
            console.error(`Failed to start connection for ${uuid}:`, error);
        }
    }

    public async stopConnection(uuid: string) {
        const sock = this.activeConnections.get(uuid);
        if (sock) {
            await sock.end(undefined);
            this.activeConnections.delete(uuid);
            // Remove o callback se existir
            this.qrCallbacks.delete(uuid);
            console.log(`Connection stopped for ${uuid}`);
        }
    }

    public getActiveConnections() {
        return Array.from(this.activeConnections.keys());
    }
}

export const whatsappService = new WhatsAppService();