import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import "./Formulario.css";
import Dropdown from "../Dropdown/Dropdown";
import iconFolder from "../../assets/icons/folderIcon.png";
import imgLoading from "../../assets/icons/loading.svg";
import logoTop from "../../assets/Logo_Conversor.png";
import { DataContext } from "../../context/DataContext";
import { ProgressSpinner } from 'primereact/progressspinner';
        


export default function Formulario() {
  const {data, setData} = useContext(DataContext);
  const [databaseName, setDatabaseName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState('');
  const orientadorDisplayExcelRef = useRef(null);
  const textFieldBD = useRef(null);

  const alterarNomeDoBanco = (event) =>{
    setDatabaseName(event.target.value);
  }

  const testeConexao = async () => {
    console.log(`Tentando conectar ao banco: ${databaseName}`);
    setLoading(true);
    try {
      if (databaseName) {
        const result = await window.database.connect(databaseName);
        if (result) {
          if(result.success ===  true){
            console.log(result);
            new window.Notification('Teste de conexão', {
              body: `Conexão realizada com sucesso!`,
              icon: logoTop,
            });
            textFieldBD.current.style.backgroundColor = '#86fc82';
            setConnectionStatus('Conectado com sucesso!');
            console.log(`Conectado com sucesso!`);
          }else{
            console.log(result);
            new window.Notification('Teste de conexão', {
              body: `Erro ao conectar ao banco!\n${result.error}`,
              icon: logoTop,
            });
            textFieldBD.current.style.backgroundColor = '#ffa1a1';
            setConnectionStatus('Erro ao conectar ao banco!');
            console.log(`Erro ao conectar ao banco!\n${result.error}`);
          }
          
          } else {
            console.log('Deu erro no preload')
        }
        setConnectionStatus(`Conectado ao banco: ${databaseName}`);
      } else {
        setConnectionStatus('Por favor, digite um nome de banco de dados.');
      }
    } catch (error) {
      console.error('Erro:', error);
    }finally{
      setLoading(false);
    }


  };

  const lidarComArquivoSelecionado = async () => {
    try {
      const resultado = await window.electron.abrirArquivoExcel();
      if (resultado) {
        const { filePath, dados } = resultado;
        const nomeArquivo = filePath.split('\\').pop();
        setFilePath(filePath);
        setFileName(nomeArquivo);
        setFileData(dados);
      } else {
        alert('Arquivo não encontrado!');
      }
    } catch (error) {
      console.log(`ERRO: ${error}`);
    }
  };

  // Atualizar `data` com os dados processados do arquivo
  //useEffect(() => {
    const carregarDados = () => {
      setLoading(true);
      
      setTimeout(() => {
        try {
          if (Array.isArray(fileData) && fileData.length > 0 && Array.isArray(fileData[0])) {
            const numColsExcel = fileData[0].length;
    
            const dadosLidos = fileData.map((row) => {
              let objetoDados = {};
              for (let i = 0; i < numColsExcel; i++) {
                objetoDados[`coluna${i + 1}`] = row[i];
              }
              return objetoDados;
            });
    
            setData(dadosLidos);
          }
        } catch (error) {
          console.log('Erro ao carregar dados', error);
        } finally {
          setLoading(false);
        }
      }, 1000);
    };
    
    
  //}, [fileData]);

  const listConversao = ['Excel', 'Business', 'Control xhb', 'Control Postgres'];
  const tipoConversao = ['Clientes', 'Produtos'];

  const handleSelect = (option) => {
    setSelectedConversion(option);
    orientadorDisplayExcelRef.current.style.display = option === 'Excel' ? 'block' : 'none';
  };

  return (
    <DataContext.Provider value={data}>
      <div className="container">
        <Dropdown itensList={listConversao} nomeLabel={'Selecione o tipo de conversão'} onSelect={handleSelect} />

        <div id="orientador-display" ref={orientadorDisplayExcelRef}>
          <form className="form-group">
            <div className="input-nome-banco">
              <label htmlFor="nomeBanco">BD que irá receber os dados</label>
              <input ref={textFieldBD} type="text" name="nomeBanco" id="nomeBanco" placeholder="Nome do Banco" onChange={alterarNomeDoBanco} />
              
            </div>
            <button type="button" id="testeConexao" onClick={testeConexao}>Testar conexão</button>
          </form>

          <div className="form-group-footer">
            <Dropdown itensList={tipoConversao} nomeLabel={'Dados a serem importados'} />
            <div onClick={lidarComArquivoSelecionado} id="buttonFilePath" style={{ backgroundColor: fileName ? '#86fc99' : '#F2F2F2' }}>
              <p>{fileName ? fileName : 'Selecione o caminho do excel'}</p>
              <img src={iconFolder} alt="Pasta" />
            </div>
            <button type="button" id="carregarDados"  onClick={carregarDados}>Carregar dados</button>
            {loading && <div className="loading"><img src={imgLoading} alt="" /></div>} {/* Mensagem de carregamento */}
          </div>
        </div>

        {/* Componente que utilizará o contexto */}
        
      </div>
    </DataContext.Provider>
  );
}

// Exportando o contexto para ser utilizado em outros componentes
export { DataContext };
