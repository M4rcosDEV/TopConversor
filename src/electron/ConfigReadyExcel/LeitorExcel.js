import fs from 'fs';
import xlsx from 'xlsx';

export default function LeitorExcel(filePath) {
    if (!filePath) {
        return "Arquivo não encontrado";
    }

    try {
        const extensao = filePath.split('.').pop().toLowerCase();
        let workbook;

        if (extensao === 'csv') {
            const dados = fs.readFileSync(filePath, 'utf8');
            console.log('Conteúdo do CSV:', dados);
            workbook = xlsx.read(dados, { type: 'string' });
        } else if (extensao === 'xls' || extensao === 'xlsx') {
            workbook = xlsx.readFile(filePath);
        } else {
            return "Arquivo não suportado";
        }

        const primeiraPlanilha = workbook.Sheets[workbook.SheetNames[0]];
        let dadosPlanilha = xlsx.utils.sheet_to_json(primeiraPlanilha, { header: 1, raw: false });

        // Determinar o número máximo de colunas
        const colunasMax = Math.max(...dadosPlanilha.map(linha => linha.length));

        // Preencher espaços vazios com string vazia
        dadosPlanilha = dadosPlanilha.map(linha => {
            return Array.from({ length: colunasMax }, (_, i) => linha[i] || "");
        });

        console.log("Dados corrigidos e estruturados:", dadosPlanilha);
        return dadosPlanilha;
    } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        return "Erro ao processar o arquivo";
    }
}
