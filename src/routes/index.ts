import { Router } from 'express';
import { whatsappService } from '../services/whatsappService';

const router = Router();

router.get('/', (req, res) => {
    res.send({ 'message': 'only socket.io' });
});

router.post('/message', async (req, res) => {
    try {
        const { uuid, phone, message } = req.body || {};
        if (!uuid || !phone || !message) {
            res.status(400).json({ error: 'Parâmetros obrigatórios: uuid, phone, message' });
            return;
        }
        const result = await whatsappService.sendMessage(uuid, phone, message);
        res.json({ ok: true, result });
    } catch (err: any) {
        res.status(500).json({ ok: false, error: err?.message || 'Erro ao enviar mensagem' });
    }
});

export default router;