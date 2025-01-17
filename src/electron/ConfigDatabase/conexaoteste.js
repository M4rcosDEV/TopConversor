const inserirDados = async (dados, columnMapping) => {
    const logs = [];

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
    };

    const dadosPorTabela = distribuirDadosPorTabela(dados, tabelaMap);

    // Obter o valor máximo de codprod
    const { success: maxProdSuccess, maxValor: maxCodProd, error: maxProdError } = await obterMaximoValor("tab_prod", "codprod");

    if (!maxProdSuccess) {
        logs.push({ type: "error", message: `Erro ao obter MAX(codprod): ${maxProdError}` });
        return { success: false, logs };
    }

    logs.push({ type: "info", message: `Maior código de produto: ${maxCodProd}` });

    // Inserir registros na tabela tab_prod
    let currentCodProd = maxCodProd + 1; // Sequência começa a partir do próximo valor

    if (dadosPorTabela.tab_prod.length > 0) {
        const registrosAtualizados = dadosPorTabela.tab_prod.map(registro => {
            return { ...registro, codprod: currentCodProd++ }; // Adiciona codprod incremental
        });

        const { success, error } = await inserirRegistros("tab_prod", registrosAtualizados);
        if (success) {
            logs.push({ type: "success", message: `Inserção na tabela tab_prod concluída!` });
        } else {
            logs.push({ type: "error", message: `Erro ao inserir na tabela tab_prod: ${error.message}` });
        }
    }

    return { success: true, logs };
};