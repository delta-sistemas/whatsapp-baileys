import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from "baileys";
import { Boom } from "@hapi/boom";
import fs from 'fs/promises';

class WhatsAppService {
    private activeConnections: Map<string, ReturnType<typeof makeWASocket>> = new Map();
    private qrCallbacks: Map<string, (qr: string) => void> = new Map();
    private statusCallbacks: Map<string, (status: string, uuid: string) => void> = new Map();

    public async closeConnection(statePath: string) {
        fs.rm(statePath, { recursive: true })
    }

    public async startConnection(uuid: string, qrCallback?: (qr: string) => void, statusCallback?: (status: string, uuid: string) => void) {
        const statePath = `./states/${uuid}`;

        // Armazena callbacks para este UUID
        if (qrCallback) {
            this.qrCallbacks.set(uuid, qrCallback);
        }
        if (statusCallback) {
            this.statusCallbacks.set(uuid, statusCallback);
        }

        // Emite status inicial
        this.statusCallbacks.get(uuid)?.('connecting', uuid);

        try {
            // Limpa conexão anterior se existir para evitar múltiplos listeners
            const existingSock = this.activeConnections.get(uuid);
            if (existingSock) {
                existingSock.ev.removeAllListeners('connection.update');
                existingSock.ev.removeAllListeners('creds.update');
                existingSock.ev.removeAllListeners('messages.upsert');
                try { existingSock.end(undefined); } catch (e) {}
            }

            const { state, saveCreds } = await useMultiFileAuthState(statePath);
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`[${uuid}] Usando WA v${version.join('.')}, isLatest: ${isLatest}`);

            const sock = makeWASocket({
                version,
                auth: state,
                browser: Browsers.ubuntu('Chrome'),
                printQRInTerminal: false,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                keepAliveIntervalMs: 30000,
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    console.log(`[${uuid}] QR Code gerado.`);
                    // Emite o QR code via callback se existir
                    const callback = this.qrCallbacks.get(uuid);
                    if (callback) {
                        callback(qr);
                    }
                }             
                // Caso específico recomendado pelo Baileys: restartRequired
                if (connection === 'close' && (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
                    console.log(`Connection requires restart for ${uuid}. Recreating socket...`);
                    // cria um novo socket; este atual torna-se inútil
                    this.startConnection(uuid);
                    return;
                }
                if (connection === 'close') {
                    const error = (lastDisconnect?.error as Boom);
                    const statusCode = error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
                    
                    console.log(`Connection CLOSED for ${uuid}. Status: ${statusCode}. Error: ${error?.message}. Data: ${JSON.stringify(error?.data)}`);

                    if (shouldReconnect) {
                        console.log(`Reconnecting ${uuid} in 3 seconds...`);
                        setTimeout(() => {
                            this.startConnection(uuid);
                        }, 3000);
                    } else {
                        this.statusCallbacks.get(uuid)?.('close', uuid);
                        this.stopConnection(uuid);
                    }
                } else if (connection === 'open') {
                    console.log(`Connection opened for ${uuid}`);
                    this.statusCallbacks.get(uuid)?.('open', uuid);
                    // Remove os callbacks após a conexão ser aberta, pois não haverá mais QR códigos
                    this.qrCallbacks.delete(uuid);
                    // Opcional: manter o statusCallback se quiser monitorar quedas de conexão futuras
                }
            });

            sock.ev.on('messages.upsert', (m) => {
                // IMPLEMENTAR LOGICA DE ENVIO PARA API DE DADOS
                console.log(`LEITURA DE MENSAGENS: ${m.messages[0].key.remoteJid}: ${m.messages[0].message?.extendedTextMessage?.text}`);
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

    public async sendMessage(uuid: string, phone: string, message: string) {
        const sock = this.activeConnections.get(uuid);
        if (!sock) {
            throw new Error('Integração não conectada ou inexistente.');
        }
        const digits = (phone || '').replace(/\D/g, '');
        if (!digits) {
            throw new Error('Telefone inválido.');
        }
        // Verifica no WhatsApp e utiliza o jid retornado se existir
        const lookup = await sock.onWhatsApp(digits).catch(() => [] as any[]);
        const entry = Array.isArray(lookup) ? lookup.find((e: any) => e?.exists) : null;
        if (!entry) {
            throw new Error('O número informado não está no WhatsApp.');
        }
        const jid = entry.jid || `${digits}@s.whatsapp.net`;
        return await sock.sendMessage(jid, { text: message });
    }
}

export const whatsappService = new WhatsAppService();