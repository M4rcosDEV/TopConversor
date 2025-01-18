import path from "path";
import fs from "fs";

const configPath = path.join(process.env.HOME || process.env.USERPROFILE, 'app-config.json');

// Função para carregar configurações
function loadConfig() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
        return { theme: 'light' }; // Padrão
    }
}

// Função para salvar configurações
function saveConfig(config) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

export default { loadConfig, saveConfig };