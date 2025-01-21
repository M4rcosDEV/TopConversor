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

                // Substituir vírgulas por pontos nos números
                dadosPlanilha = dadosPlanilha.map(linha => 
                    linha.map(valor => 
                        typeof valor === 'string' && valor.includes(",") && !isNaN(valor.replace(",", "."))
                            ? parseFloat(valor.replace(",", "."))
                            : valor
                    )
                );

                console.log("Dados corrigidos:", dadosPlanilha);
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
