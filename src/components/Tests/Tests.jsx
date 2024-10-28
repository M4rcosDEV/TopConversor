// import React, { useState } from 'react';
// import { Client } from 'pg';

// const client = new Client({
//   user: 'seu_usuario',
//   host: 'localhost',
//   database: 'seu_banco_de_dados',
//   password: 'sua_senha',
//   port: 5432,
// });

// client.connect();

// const App = () => {
//   const [vinculacoes, setVinculacoes] = useState({});

//   const handleDropdownChange = (key, valor) => {
//     setVinculacoes((prev) => ({
//       ...prev,
//       [key]: valor,
//     }));
//   };

//   const inserirDados = async (vinculacoes) => {
//     const query = `
//       INSERT INTO sua_tabela (codprod, nomprod, espprod, graprod)
//       VALUES ($1, $2, $3, $4)
//     `;
//     const values = [vinculacoes.codprod, vinculacoes.nomprod, vinculacoes.espprod, vinculacoes.graprod];

//     try {
//       await client.query(query, values);
//       console.log('Dados inseridos com sucesso');
//     } catch (error) {
//       console.error('Erro ao inserir dados:', error);
//     }
//   };

//   const handleSubmit = () => {
//     console.log(vinculacoes); // Saída no console para verificar os dados
//     inserirDados(vinculacoes);
//   };

//   return (
//     <div>
//       <button onClick={handleSubmit}>Enviar Dados</button>
//       {/* Adicione aqui os seus dropdowns e outros componentes */}
//     </div>
//   );
// };

// export default App;

import React, { useState, useContext } from 'react';
import { DataContext } from "../../context/DataContext";
import Dropdown from './Dropdown';
import './ColunasInformacao.css';

export default function ColunasInformacao() {
  const { data } = useContext(DataContext);
  const colunas = ['codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 'cl3prod'];

  // Estado para armazenar as vinculações de colunas e valores
  const [vinculacoes, setVinculacoes] = useState({});
  // console.table(data);

  // Função para lidar com a seleção do dropdown
  const handleDropdownChange = (key, valor) => {
    setVinculacoes((prev) => ({
      ...prev,
      [key]: valor, // Vincula a coluna com o valor
    }));
  };

  // Função para lidar com o envio dos dados
  const handleSubmit = () => {
    // Aqui você pode processar os dados vinculados para enviar ao banco de dados
    console.log(vinculacoes); // Exibe as vinculações no console
    // Implemente a lógica de inserção no banco de dados aqui
  };

  return (
    <div>
      <div className='conteudo-coluna'> 
        {data && data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div className='item-list-linha' key={rowIndex}>
              {Object.keys(row).map((key) => (
                <div key={key} className='item-linha'>
                  <Dropdown 
                    itensList={colunas} 
                    // nomeLabel={Vincular ${key}} 
                    onChange={(valor) => handleDropdownChange(key, row[key])} 
                  />
                  <p>
                    {typeof row[key] === 'string' ? row[key].toUpperCase() : String(row[key])}
                  </p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className='no-found'>Nenhum dado disponível.</p>
        )}
      </div>

      <button type="button" onClick={handleSubmit}>Enviar Dados</button>
    </div>
  );
}


//aqui lista cada  coluna com o seu proprio nome,idade, etc

import React, { useContext, useRef, useState } from 'react';
import { DataContext } from "../../context/DataContext";
import './ColunasInformacao.css'
import Dropdown from '../Dropdown/Dropdown';
import iconOpenBox from "../../assets/icons/open-box.png";
import laughter from "../../assets/icons/laughter.png";

export default function ColunasInformacao() {
    const [count, setCount] = useState(0);
    const imgMove = useRef(null);
    const imglaughter = useRef(null);
  const {data} = useContext(DataContext);
  const tipoConversao = ['Clientes', 'Produtos'];
  const colunas =['codprod', 'nomprod', 'espprod', 'graprod', 'codfabr', 'codfili', 'cl1prod', 'cl2prod', 'cl3prod', 'cl4prod', 'depprod', 'tipprod', 'obsprod', 'desresu', 'fgedeci', 'xyzprod', 'atuprod', 'cod_ipi', 'cod_irr', 'subfede', 'ncmprod', 'imgprod', 'refgrad', 'codgrad', 'codregr', 'filfabr', 'marprod', 'negprod', 'indprod', 'tipipro', 'genepro', 'lisipro', 'ex_prod', 'indprop', 'codprop', 'filprop', 'endprop', 'ctnprod', 'cbccpro', 'recprod', 'prociap', 'prodepr', 'regr_sa', 'regr_en', 'parfide', 'escombo', 'agrgrad', 'lismate', 'ctnfatu', 'syngrad', 'prouuid', 'negunid', 'divisa1', 'divisa2', 'divisa3', 'divisa4', 'divisa5', 'vndiven', 'codprod', 'duraiven', 'iteiven', 'qtdiven', 'qtddevol', 'vlriven', 'tipiven', 'codnatu', 'tipnatu', 'veniven', 'vlrdesc', 'filprod', 'datvend', 'filiven', 'usonatu', 'sesprod', 'sefprod', 'iniaten', 'finaten', 'seqprod', 'ivenvnd', 'ivenite', 'ivenfil', 'codsequ', 'keyiven', 'id_prod'];



  const translateImg = () =>{
    setCount(count + 1);
    const randomX = (Math.random() - 0.5) * 1000;
    const randomY = (Math.random() - 0.5) * 1000;
    
    imgMove.current.style.transform = `translate(${randomX}px, ${randomY}px)`;

    if(count >= 10){
        imglaughter.current.style.display = 'block'
    }else{
        imgMove.current.style.display = 'none'
    }
  };

  return (
    <div>
    <div className='colunas'>
        {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
            <div className='coluna' key={rowIndex}>
                <Dropdown itensList={colunas} nomeLabel={'Dados a serem importados'} />

                <div className='conteudo-coluna'>
                {Object.keys(row).map((key) => (
                    <div className='item-list-linha' key={key}>

                        <p key={key} className='item-linha'>
                        {typeof row[key] === 'string' ? row[key].toUpperCase() : String(row[key])}
                        </p>
                    </div>
                        // Exibe cada propriedade da row
                ))}
                </div>
            </div>
            ))
        ) : (
            <div className='container-vazio'>
                <img ref={imglaughter} src={laughter} alt="Vazio" style={{display:'none'}}/>
                <img ref={imgMove} src={iconOpenBox} alt="Vazio" className='icon-open-box' onMouseMove={translateImg}/>
                <p >Nenhum dado disponível</p>
            </div>
            
        )}
    </div>

    </div>
  );
}

