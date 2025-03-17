import makeWASocket, { 
    Browsers,
    DisconnectReason, 
    useMultiFileAuthState 
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from 'fs';


export async function connectToWhatsApp({ uuid }: { uuid: string }) {
    const statePath = `./states/${uuid}`;
    const { state, saveCreds } = await useMultiFileAuthState(statePath);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.windows('opera')
    });

    async function closeConnection(statePath: string) {
        fs.unlink(statePath, err => {
            console.log(err)
        })
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                "connection closed due to ",
                lastDisconnect?.error,
                ", reconnecting ",
                shouldReconnect
            );
            closeConnection(statePath);
            // reconnect if not logged out
            if (shouldReconnect) {
                connectToWhatsApp({ uuid: uuid });
            }
        } else if (connection === "open") {
            console.log("opened connection");
        }
    });

    sock.ev.on("messages.upsert", async (m) => {
        console.log("Message from", m.messages[0].key.remoteJid, m.messages[0].message?.extendedTextMessage?.text);
        
        // await sock.sendMessage(m.messages[0].key.remoteJid!, {
        // text: "Hello there!",
        // });
    });
}