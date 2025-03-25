import { access, rm, unlink } from 'fs/promises';
import path from 'path';

// Função para deletar a integração
export const deleteIntegrationService = async (uuid: string) => {
    try {

        const statePath = `./states/${uuid}`;

        await access(statePath)

        await rm(statePath, { recursive: true });

        console.log(`Arquivo da integração ${uuid} apagado com sucesso.`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // Arquivo não encontrado
            throw new Error('Arquivo da integração não encontrado.');
        } else {
            // Outros erros
            throw new Error(`Erro ao apagar o arquivo: ${error.message}`);
        }
    }
};