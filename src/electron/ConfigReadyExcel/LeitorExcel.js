import fs  from 'fs';
import  xlsx from 'xlsx';

export default function LeitorExcel(filePath){
    if(filePath){
        const extensao = filePath.split('.').pop().toLowerCase();

        if (extensao === 'csv') {
            const dados = fs.readFileSync(filePath, 'utf8');
            console.log('Conteúdo do CSV:', dados);

            const workbook  = xlsx.read(dados, { type: 'string' });
            const primeiraPlanilha  = workbook.Sheets[workbook.SheetNames[0]];
            const dadosPlanilha = xlsx.utils.sheet_to_json(primeiraPlanilha, { header: 1 });

            // console.log('Dados da planilha');
            // dadosPlanilha.forEach ((linha, index) => {
            //     console.log(`Linha ${index + 1}: ${linha.join(', ')}`);
            // });

            //console.log(dadosPlanilha[0]);
            return dadosPlanilha; 
        }else{
            return  "Arquivo não suportado";
        }
    }else{
        return "Arquivo não encontrado";
    }
    
}