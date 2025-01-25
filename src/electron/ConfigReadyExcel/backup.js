import fs from 'fs';
import xlsx from 'xlsx';

export default function LeitorExcel(filePath) {
    if (filePath) {
        const extensao = filePath.split('.').pop().toLowerCase();

        if (extensao === 'csv') {
            try {
                const dados = fs.readFileSync(filePath, 'utf8');
                console.log('Conteúdo do CSV:', dados);

                // Lendo o CSV corretamente
                const workbook = xlsx.read(dados, { type: 'string' });
                const primeiraPlanilha = workbook.Sheets[workbook.SheetNames[0]];
                let dadosPlanilha = xlsx.utils.sheet_to_json(primeiraPlanilha, { header: 1, raw: false });

                // Determinar o número máximo de colunas em todas as linhas
                const colunasMax = Math.max(...dadosPlanilha.map(linha => linha.length));

                // Preencher espaços vazios com string vazia
                dadosPlanilha = dadosPlanilha.map(linha => {
                    const novaLinha = Array.from({ length: colunasMax }, (_, i) => linha[i] || ""); // Preencher valores ausentes
                    return novaLinha;
                });

                console.log("Dados corrigidos e estruturados:", dadosPlanilha);
                return dadosPlanilha;
            } catch (error) {
                console.error("Erro ao processar o arquivo CSV:", error);
                return "Erro ao processar o arquivo";
            }
        } else {
            return "Arquivo não suportado";
        }
    } else {
        return "Arquivo não encontrado";
    }
}
