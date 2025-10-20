import { access, rm, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { whatsappService } from './whatsappService';

// Função para criar nova integração
export const createIntegrationService = async (qrCallback?: (qr: string) => void) => {
    try {
        // Gera um UUID único para a nova integração
        const uuid = uuidv4();
        
        // Cria o diretório para armazenar o estado
        const statePath = `./states/${uuid}`;
        await mkdir(statePath, { recursive: true });
        
        // Inicia a conexão WhatsApp com callback para QR code
        await whatsappService.startConnection(uuid, qrCallback);
        
        console.log(`Nova integração criada com UUID: ${uuid}`);
        
        return {
            uuid,
            status: 'pending',
            message: 'Integração criada. Aguardando QR code...'
        };
    } catch (error: any) {
        throw new Error(`Erro ao criar integração: ${error.message}`);
    }
};

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