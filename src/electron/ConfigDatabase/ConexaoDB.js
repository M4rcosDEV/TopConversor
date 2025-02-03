
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config'
import xlsx from 'xlsx';
import notificacao from '../main.js'
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg

let database;

let senha;

const alterarSenha = (novaSenha)  => {
     senha = novaSenha;
}

const conectarBanco = async (nomeBanco, senha) => {
    if (database) {
        await database.end(); 
    }
    database = new Pool({
        user: 'postgres',
        password: senha || 'amstopams',
        host: 'localhost',
        port: '5432',
        database: nomeBanco,
    });

    console.log(`SENHA: ${senha}`)
    try {
        await database.query('SELECT NOW()');
        console.log('Conectado ao banco de dados:', nomeBanco);
        return { success: true };
    } catch (error) {
        console.error('Erro ao conectar:', error);
        return { success: false, error: error.message, coderror: error.code };
    }

}

const obterDataAtual = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0'); // Garante dois dígitos
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0, então adicionamos 1
    const ano = hoje.getFullYear();

    return `${dia}-${mes}-${ano}`;
};

const executarQuery = async (query) => {
    try {
        const result = await database.query(query);
        return { success: true, result };
    } catch (error) {
        console.error(`Erro ao executar query: ${error.message}`);
        return { success: false, error };
    }
};

const executarQueryDefault = async (query) => {
    // Exemplo de função para executar a query
    try {
        const result = await database.query(query); // Certifique-se de que `database.query` está funcionando corretamente
        return { success: true, result: result.rows }; // Supondo que o banco retorna um objeto com `rows`
    } catch (error) {
        console.error(`Erro ao executar query: ${error.message}`);
        return { success: false, error: error.message }; // Retorna apenas a mensagem de erro
    }
};

const obterMaximoValor = async (tabela, coluna) => {
    const query = `SELECT MAX(${coluna}) AS maxValor FROM ${tabela}`;
    console.log(`linha 72: ${query}`);
    const { success, result, error } = await executarQuery(query);

    if (success && result.rows.length > 0) {
        const maxValor = result.rows[0]?.maxvalor || 0;
        return { success: true, maxValor };
    } else {
        return { success: false, error: error || "Nenhum resultado encontrado." };
    }
};

const obterProxSequeciaCodgrad = async (nome_sequencia) => {
    const query = `SELECT last_value, is_called FROM ${nome_sequencia}`;
    console.log(`Executando query: ${query}`);

    const { success, result, error } = await executarQuery(query);

    if (success && result.rows.length > 0) {
        const { last_value, is_called } = result.rows[0];

        // Se a sequência nunca foi usada, pode ser necessário chamar NEXTVAL()
        if (!is_called) {
            const fixQuery = `SELECT NEXTVAL('${nome_sequencia}') AS proxSequecia`;
            console.log(`Forçando chamada de sequência: ${fixQuery}`);
            const { success: fixSuccess, result: fixResult } = await executarQuery(fixQuery);
            
            if (fixSuccess && fixResult.rows.length > 0) {
                return { success: true, proxSequecia: fixResult.rows[0].proxSequecia };
            } else {
                return { success: false, error: "Falha ao obter sequência com NEXTVAL." };
            }
        }

        return { success: true, proxSequecia: last_value };
    } else {
        return { success: false, error: error || "Nenhum resultado encontrado." };
    }
};


const distribuirDadosPorTabela = (dados, tabelaMap) => {
    const dadosPorTabela = {};
    Object.keys(tabelaMap).forEach(tabela => dadosPorTabela[tabela] = []);

    dados.forEach(item => {
        Object.entries(tabelaMap).forEach(([tabela, colunas]) => {
            const valores = {};
            colunas.forEach(coluna => {
                if (item[coluna] !== undefined) {
                    valores[coluna] = item[coluna];
                }
            });
            if (Object.keys(valores).length > 0) {
                dadosPorTabela[tabela].push(valores);
            }
        });
    });

    return dadosPorTabela;
};


const inserirRegistros = async (tabela, registros) => {
    if (registros.length === 0) return { success: true };

    const colunas = Object.keys(registros[0]);
    const valores = registros.map(registro =>
        `(${colunas.map(coluna => `'${registro[coluna]}'`).join(", ")})`
    );

    const query = `
        INSERT INTO ${tabela} (${colunas.join(", ")})
        VALUES ${valores.join(", ")};
    `;

    // Adicionando o console.log para verificar a estrutura do INSERT
    console.log("Generated INSERT Query:", query);

    return await executarQuery(query);
};

const criarSequencia = (dados, coluna, valorInicial) => {
    let contador = valorInicial;
    return dados.map(registro => {
        registro[coluna] = contador++;
        return registro;
    });
};

const preencherColunasComValores = (registros, valoresPorColuna) => {
    return registros.map(registro => {
        Object.entries(valoresPorColuna).forEach(([coluna, valor]) => {
            registro[coluna] = valor; // Define o valor para a coluna específica
        });
        return registro;
    });
};


const substituirNullPorZero = (dados, colunasComZeroPadrao) => {
    return dados.map(registro => {
        colunasComZeroPadrao.forEach(coluna => {
            if (registro[coluna] === null || registro[coluna] === undefined) {
                registro[coluna] = 0;
            }
        });
        return registro;
    });
};

const inserirDadosClientes = async (dados, columnMapping) => {
    const logs = [];
    const updatedData = dados.map(item => ({
        ...item,
        claparc: '00',
        cgcende: item.cnpparc
      }));

    //Filtrar apenas objetos onde `nomparc` ultrapassa 20 caracteres
    const dadosFiltrados = [];
    const dadosRestantes = updatedData.filter(obj => {
        if (obj.nomparc && obj.nomparc.length > 20) {
            dadosFiltrados.push(obj); // Adiciona ao array para o Excel
            return false; // Remove do array original
        }
        return true; // Mantém no array original
    });
    
    console.log("Dados filtrados para o Excel:", dadosFiltrados);
    console.log("Dados restantes após a remoção:", dadosRestantes);

    if (dadosFiltrados.length === 0) {
        console.log("Nenhum `nomparc` ultrapassa 20 caracteres. Nenhum arquivo CSV foi gerado.");
    } else {
        // 2️⃣ Criar um CSV com os dados filtrados
        const ws = xlsx.utils.json_to_sheet(dadosFiltrados, { header: Object.keys(dados[0]) });
        const csvData = xlsx.utils.sheet_to_csv(ws);
    
        // 3️⃣ Salvar o arquivo CSV
        const filePath = "dados_filtrados.csv";
        fs.writeFileSync(filePath, csvData, "utf8");
        console.log(`Arquivo CSV salvo com sucesso: ${filePath}`);

          notificacao.notification(
                'Top Conversor',
                `Arquivo com dados filtrados gerado com sucesso : ${filePath}`,
                true,
                path.join(__dirname, '..','..', 'assets', 'Logo_Conversor.png'),
            );
    }
    
    // if (dadosFiltrados.length === 0) {
    //     console.log("Nenhum `nomparc` ultrapassa 20 caracteres. Nenhum arquivo foi gerado.");
    // } else {
    //     // Criar a planilha Excel com os dados filtrados
    //     const ws = xlsx.utils.json_to_sheet(dadosFiltrados, { header: Object.keys(dados[0]) });
    
    //     // Criar um novo workbook e adicionar a planilha
    //     const wb = xlsx.utils.book_new();
    //     xlsx.utils.book_append_sheet(wb, ws, "Dados Filtrados");
    
    //     // Salvar o arquivo Excel
    //     const filePath = "dados_filtrados.xlsx";
    //     xlsx.writeFile(wb, filePath);
    //     console.log(`Arquivo Excel salvo com sucesso: ${filePath}`);
    // }

    //console.log(`TESTE DADOS: ${JSON.stringify(updatedData)}`);

    if (!database) {
        const error = "Banco de dados não conectado.";
        logs.push({ type: "error", message: error });
        return { success: false, logs };
    }

    const tabelaMap = {

        tab_parc: [
            'codparc', 'nomparc', 'codfili', 'sobparc', 'cnpparc', 'regparc', 'nasparc', 'cadparc', 'altparc', 'obsparc',
            'homparc', 'emaparc', 'venpref', 'plapref', 'cobpref', 'spccons', 'negparc', 'ultcont', 'ultvend', 'filaval',
            'codaval', 'limcred', 'doctipo', 'estcivi', 'sexparc', 'pesparc', 'codocup', 'nacparc', 'natparc', 'ctpparc',
            'cnhparc', 'cat_cnh', 'supparc', 'admparc', 'demparc', 'nomempr', 'endempr', 'comempr', 'dddempr', 'fonempr',
            'antempr', 'ctpseri', 'fgeparc', 'filconj', 'codconj', 'nomconj', 'cnpconj', 'nasconj', 'emaconj', 'ddfconj',
            'fonconj', 'ddcconj', 'celconj', 'porempr', 'tipempr', 'iprparc', 'ultende', 'renparc', 'imgparc', 'dis_iss',
            'motbloq', 'rntparc', 'tacparc', 'tpaparc', 'ucbparc', 'datconj', 'atvagend', 'codrfid', 'cnhvali', 'obsconj',
            'undparc', 'co_fina', 'obsfina', 'agenseg', 'agenter', 'agenqua', 'agenqui', 'agensex', 'agensab', 'agendom',
            'usuparc', 'regprec', 'codante', 'datbloq', 'indbloq', 'senparc', 'pisparc', 'codhora', 'filante', 'paiparc',
            'maeparc', 'rotparc', 'falparc', 'comfale', 'oriparc', 'coddeli', 'update_at', 'ctaclie', 'ctaforn', 'custpad',
            'logcadw', 'fgelgpd', 'percomi', 'dia_lib'
        ],

        tab_ende: [
            'codparc', 'fonende', 'cgcende', 'ieende', 'endende', 'baiende', 'codcida', 'cepende', 'numende', 'nomende',
            'filparc', 'faxende', 'celende', 'ddd_fon', 'complem', 'referen', 'tiplogr', 'nommuni', 'uf_ende', 'paiende', 
            'ordende', 'iesende', 'sufende', 'optsimp', 'im_ende', 'ctbicms', 'ramtelf', 'nomgest', 'cpfgest', 'emagest',
            'crggest', 'ftaparc', 'prlparc', 'cpsparc', 'dafparc', 'temresi', 'numfunc', 'vlraluq', 'cnaeend', 'tpeende',
            'ip_ende', 'pe_ende', 'ireende', 'gpslong', 'gpslati', 'asfende', 'estende', 'entende', 'seqende', 'nom_end',
            'iiedest', 'regimet', 'coddeli', 'codtaen', 'update_at', 'fgeende', 'idendpw', 'azulzon'
        ],  
        
        tab_clap: [
            'filparc', 'codparc', 'claparc'
        ]   
    }

    const dadosPorTabela = distribuirDadosPorTabela(dadosRestantes, tabelaMap);
    const { success: maxParcSuccess, proxSequecia: maxCodParc } = await obterProxSequeciaCodgrad("seq_tabparc");

    if (!maxParcSuccess) {
        logs.push({ type: "error", message: "Erro ao obter valores máximos." });
        return { success: false, logs };
    }
    
    console.log(maxCodParc);
    logs.push({ type: "info", message: `Proximo da sequencia do codparc: ${maxCodParc}` });

    const incrementoCodParc = parseInt(maxCodParc) + 1;

    try {
        // Inicia a transação
        await database.query('BEGIN');
        logs.push({ type: "info", message: "Transação iniciada." });

        for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
            let registrosAtualizados = [...registros];

            if (tabela === "tab_parc") {
                //registrosAtualizados = criarSequencia(registrosAtualizados, "codprod", incrementoCodProd);
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    cadparc: obterDataAtual(),
                    fgeparc: -1,
                    porempr: 'O',
                    dis_iss: 0,
                    usuparc: 1,
                });

            }
    
            if (tabela === "tab_ende") {
                //registrosAtualizados = criarSequencia(registrosAtualizados, "codparc", incrementoCodParc);
                registrosAtualizados = registrosAtualizados.map((registro, index) => {
                    registro.codparc = incrementoCodParc + index; // Incrementa codparc sequencialmente
                    //registro.codprod = incrementoCodProd + index; // Incrementa codprod sequencialmente
                    return registro;
                });

                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    filparc: '001',
                    paiende: 1058,
                    ordende: 1,
                    optsimp: 0,
                    ctbicms: 0,
                });
            }
    
            if (tabela === "tab_clap") {
                registrosAtualizados = registrosAtualizados.map((registro, index) => {
                    registro.codparc = incrementoCodParc + index; // Incrementa codparc sequencialmente
                    return registro;
                });

                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    filparc: '001',
                });
            }

            const { success, error } = await inserirRegistros(tabela, registrosAtualizados);
            if (success) {
                logs.push({ type: "success", message: `Inserção na tabela ${tabela} concluída.` });
            } else {
                throw new Error(`Erro ao inserir na tabela ${tabela}: ${error.message}`);
            }
        }

        // Confirma a transação
        await database.query('COMMIT');
        logs.push({ type: "info", message: "Transação concluída com sucesso." });

        return { success: true, logs };

    } catch (error) {
        // Reverte a transação em caso de erro
        await database.query('ROLLBACK');
        logs.push({ type: "error", message: `Erro na transação: ${error.message}. Todas as alterações foram desfeitas.` });
        return { success: false, logs };
    }
}

const inserirDadosProdutos = async (dados, columnMapping) => {
    const logs = [];
    console.log(`TESTE DADOS: ${JSON.stringify(dados)}`);
    if (!database) {
        const error = "Banco de dados não conectado.";
        logs.push({ type: "error", message: error });
        return { success: false, logs };
    }

    const tabelaMap = {

        tab_prod: [
            'codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 
            'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 
            'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 
            'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 
            'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 
            'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 
            'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 
            'divisa5'
        ],

        tab_grad: [
            'codgrad', 'codprod', 'codidiv', 'codisub', 'unvgrad', 'uncgrad', 'estmini', 'pesliqu', 
            'pesbrut', 'desmaxi', 'percomi', 'margrad', 'fatconv', 'obsgrad', 'lo1grad', 'lo2grad', 
            'ptopedi', 'fgecomi', 'refgrad', 'gragrad', 'filprod', 'lucgrad', 'pzorese', 'fgenser', 
            'fgelote', 'fgelotv', 'cfdgrad', 'cffgrad', 'ncmgrad', 'dtagrad', 'ctngrad', 'md5grad', 
            'codante', 'metgrad', 'tipcomi', 'sercomp', 'diaprox', 'mkpgrad', 'exc_ncm', 'codcest', 
            'bcpicms', 'bcpicst', 'usesite', 'gtingra', 'proanpc', 'proanpd', 'tmpgrad', 'paigrad', 
            'itempai', 'embgrad', 'maxacre', 'pglpgra', 'pgnngra', 'estaten', 'vpartgr', 'ml_grad', 
            'diasgra', 'tribuid', 'iterele', 'itecnpj', 'datvenc', 'diavenc', 'livreid', 'cobenef', 
            'usegrad', 'purgrad', 'gergrad', 'metrage', 'estomax', 'tzgrad', 'grauuid', 'ml_cate', 
            'ml_idpd', 'lo3grad', 'vitrine', 'cfgbala', 'codanvi', 'motanvi', 'preanvi', 'multemp', 
            'biograd', 'impcomb', 'ufocomb', 'pufcomb', 'deslivr', 'idivi_1', 'idivi_2', 'idivi_3', 
            'idivi_4', 'idivi_5'
        ],  
        
        tab_esto: [
            'codigra', 'estiest', 'resiest', 'filesto', 'precomp', 'ultcust', 'cusmedi', 'cuspond', 
            'prevend', 'preprom', 'preatac', 'proplan', 'prodtin', 'prodtfi', 'curvabc', 'estnega', 
            'forlinh', 'codesto', 'ajuprec', 'qtdatac', 'custefe', 'pr1esto', 'pr2esto', 'qtdpend', 
            'estuuid', 'intrasi', 'chegaem', 'vlrcomp', 'qtdprom', 'vqtprom', 'lo1esto', 'lo2esto', 
            'lo3esto', 'obsprom', 'qtdata2', 'preata2', 'giroest'
        ],     
        
    };

    const dadosPorTabela = distribuirDadosPorTabela(dados, tabelaMap);

    const { success: maxProdSuccess, maxValor: maxCodProd } = await obterMaximoValor("tab_prod", "codprod");
    const { success: maxGradSuccess, maxValor: maxCodGrad } = await obterMaximoValor("tab_grad", "codgrad");

    if (!maxProdSuccess || !maxGradSuccess) {
        logs.push({ type: "error", message: "Erro ao obter valores máximos." });
        return { success: false, logs };
    }

    logs.push({ type: "info", message: `Maior codprod: ${maxCodProd}, maior codgrad: ${maxCodGrad}` });

    const incrementoCodProd = parseInt(maxCodProd) + 1;
    const incrementoCodGrad = parseInt(maxCodGrad) + 1;

    try {
        // Inicia a transação
        await database.query('BEGIN');
        logs.push({ type: "info", message: "Transação iniciada." });

        for (const [tabela, registros] of Object.entries(dadosPorTabela)) {
            let registrosAtualizados = [...registros];

            if (tabela === "tab_prod") {
                registrosAtualizados = criarSequencia(registrosAtualizados, "codprod", incrementoCodProd);
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    codfili: '001',
                    depprod: 0,
                    tipprod: 'MA',
                    negprod: 0,
                    indprod:'F',
                    tipipro:'00',
                    endprop: 1
                });
            }
    
            if (tabela === "tab_grad") {
                registrosAtualizados = registrosAtualizados.map((registro, index) => {
                    registro.codgrad = incrementoCodGrad + index; // Incrementa codgrad sequencialmente
                    registro.codprod = incrementoCodProd + index; // Incrementa codprod sequencialmente
                    
                    return registro;
                    
                });
    
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    codidiv: 0,
                    codisub: 0,
                    margrad: -1,
                    fgecomi: 0,
                    filprod: '001',
                    dtagrad: obterDataAtual(),
                    ml_grad: ' ',
                    usegrad: 1
                });
            }
    
            if (tabela === "tab_esto") {
                registrosAtualizados = criarSequencia(registrosAtualizados, "codigra", incrementoCodGrad);
                registrosAtualizados = preencherColunasComValores(registrosAtualizados, {
                    resiest: 0,
                    filesto: '001',
                    curvabc: 'N'
                });
            }

            const { success, error } = await inserirRegistros(tabela, registrosAtualizados);
            if (success) {
                logs.push({ type: "success", message: `Inserção na tabela ${tabela} concluída.` });
            } else {
                throw new Error(`Erro ao inserir na tabela ${tabela}: ${error.message}`);
            }
        }

        // Confirma a transação
        await database.query('COMMIT');
        logs.push({ type: "info", message: "Transação concluída com sucesso." });

        return { success: true, logs };

    } catch (error) {
        // Reverte a transação em caso de erro
        await database.query('ROLLBACK');
        logs.push({ type: "error", message: `Erro na transação: ${error.message}. Todas as alterações foram desfeitas.` });
        return { success: false, logs };
    }
};

export default { conectarBanco, inserirDadosProdutos, inserirDadosClientes, executarQueryDefault };
