const fs = require('fs').promises; // Usando promises para async/await
const path = require('path');

export async function listSubdirectories(dirPath: string) {
    try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        const folders = items
            .filter((item: any) => item.isDirectory())
            .map((item: any) => item.name);
        return folders;
    } catch (err) {
        console.error('Erro ao ler diretório:', err);
        return [];
    }
}