import makeWASocket, { Browsers, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from 'fs/promises';

class WhatsAppService {
    private activeConnections: Map<string, ReturnType<typeof makeWASocket>> = new Map();
    private qrCallbacks: Map<string, (qr: string) => void> = new Map();
    private statusCallbacks: Map<string, (status: string, uuid: string) => void> = new Map();


    public async closeConnection(statePath: string) {
        fs.rm(statePath, { recursive: true })
    }

    public async startConnection(
        uuid: string, 
        qrCallback?: (qr: string) => void,
        statusCallback?: (status: string, uuid: string) => void
    ) {

        const statePath = `./states/${uuid}`;

        // Se um callback de QR foi fornecido, armazena para este UUID
        if (qrCallback) {
            this.qrCallbacks.set(uuid, qrCallback);
        }

        // Se um callback de status foi fornecido, armazena para este UUID
        if (statusCallback) {
            this.statusCallbacks.set(uuid, statusCallback);
        }


        try {
            const { version, isLatest } = await fetchLatestBaileysVersion();
            console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

            const { state, saveCreds } = await useMultiFileAuthState(statePath);

            const sock = makeWASocket({
                version,
                auth: state,
                browser: Browsers.windows('Chrome'),
            });

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    // Emite o QR code via callback se existir
                    const callback = this.qrCallbacks.get(uuid);
                    if (callback) {
                        callback(qr);
                        // Não removemos o callback aqui pois o Baileys pode emitir novos QR codes se o anterior expirar
                    }
                }

                if (connection) {
                    // Emite o status via callback se existir
                    const callback = this.statusCallbacks.get(uuid);
                    if (callback) {
                        callback(connection, uuid);
                    }
                }

                // Caso específico recomendado pelo Baileys: restartRequired
                if (connection === 'close' && (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.restartRequired) {
                    console.log(`Connection requires restart for ${uuid}. Recreating socket...`);
                    // cria um novo socket; este atual torna-se inútil
                    this.startConnection(uuid, this.qrCallbacks.get(uuid), this.statusCallbacks.get(uuid));
                    return;
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log(`Connection closed for ${uuid}. Reconnecting: ${shouldReconnect}`);

                    if (shouldReconnect) {
                        this.startConnection(uuid, this.qrCallbacks.get(uuid), this.statusCallbacks.get(uuid));
                    } else {

                        this.stopConnection(uuid);
                    }
                } else if (connection === 'open') {
                    console.log(`Connection opened for ${uuid}`);
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
            // Remove os callbacks se existirem
            this.qrCallbacks.delete(uuid);
            this.statusCallbacks.delete(uuid);
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