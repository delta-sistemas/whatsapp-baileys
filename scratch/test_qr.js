
import makeWASocket, { Browsers, useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";

async function test() {
    console.log("Starting test...");
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const { state, saveCreds } = await useMultiFileAuthState('./scratch/auth_test');

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        browser: Browsers.windows('Chrome'),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("QR CODE GENERATED!");
        }
        if (connection === 'close') {
            console.log("Connection closed", lastDisconnect?.error);
        } else if (connection === 'open') {
            console.log("Connection opened");
        }
    });
}

test().catch(console.error);