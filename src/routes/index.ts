import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send({ 'message': 1234 });
});

router.delete('/integrations/delete/:uuid', (req, res) => {
    const integrationUuid = req.params.uuid;
    console.log(integrationUuid)
    res.send(`Integração ID: ${integrationUuid}`);
})

router.get('/user/:id', (req: Request, res: Response) => {
    const userId = req.params.id; 
    res.send(`Usuário ID: ${userId}`);
});




export default router;