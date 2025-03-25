import { Request, Response } from 'express';
import { deleteIntegrationService } from '../services/integrationService';


export const newIntegration = async (req: Request, res: Response) => {
    try {
        res.status(200)
    }catch (err: any) {
        res.status(500)
    }
}

export const deleteIntegration = async (req: Request, res: Response) => {
  const { uuid } = req.params;

  try {
    // Chama o service para deletar a integração
    await deleteIntegrationService(uuid);

    // Resposta de sucesso
    res.status(200).json({ message: 'Integração deletada com sucesso.' });
  } catch (error: any) {
    // Resposta de erro
    res.status(500).json({ error: error.message });
  }
};