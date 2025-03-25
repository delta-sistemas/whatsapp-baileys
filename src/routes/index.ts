import { Router, Request, Response } from 'express';
import integrationsRouter from './integrations';

const router = Router();

router.get('/', (req, res) => {
    res.send({ 'message': 1234 });
});

router.use('/integrations', integrationsRouter);

router.get('/user/:id', (req: Request, res: Response) => {
    const userId = req.params.id; 
    res.send(`Usuário ID: ${userId}`);
});




export default router;