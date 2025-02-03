import React, { useState, useRef, useEffect, useContext } from "react";
import "./Formulario.css";
import Dropdown from "../Dropdown/Dropdown";
import iconFolder from "../../assets/icons/folderIcon.png";
import logoTop from "../../assets/Logo_Conversor.png";
import { DataContext } from "../../context/DataContext";
import Loading from '../Loading/Loading';
import DialogoInformacao from "../DialogoInformacao/DialogoInformacao";

export default function Formulario() {
  const { data, setData } = useContext(DataContext);
  const { selectedTypeOption, setSelectedTypeOption } = useContext(DataContext);
  const { showInsertData, setShowInsertData } = useContext(DataContext);
  const [databaseName, setDatabaseName] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedConversion, setSelectedConversion] = useState('');
  const orientadorDisplayExcelRef = useRef(null);
  const [dialogoinfo, setDialogoinfo] = useState(false);
  const textFieldBD = useRef(null);
  const [pendingTypeOption, setPendingTypeOption] = useState(null);

  // Efeito para focar no input do nome do banco quando a opção "Excel" é selecionada
  useEffect(() => {
    if (selectedConversion === 'Excel' && textFieldBD.current) {
      textFieldBD.current.focus(); // Foca no input do nome do banco
    }
  }, [selectedConversion]); // Executa sempre que selectedConversion mudar

  // Efeito para capturar o evento de tecla "Enter" apenas no input do nome do banco
  useEffect(() => {
    const inputElement = textFieldBD.current;

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Impede o comportamento padrão do Enter (submit do formulário)
        console.log('Enter pressionado no input do nome do banco'); // Verifique se o evento está sendo capturado
        console.log('Valor do input:', databaseName); // Verifique o valor do input
        testeConexao(); // Executa a função de teste de conexão
      }
    };

    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDown); // Adiciona o listener ao input
    }

    // Remove o listener quando o componente é desmontado
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDown); // Remove o listener do input
      }
    };
  }, [databaseName]); 

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.key === 'd') { // Verifica se Ctrl + D foi pressionado
        event.preventDefault(); // Impede o comportamento padrão do navegador
        console.log('Ctrl + D pressionado'); // Verifique se o evento está sendo capturado
        lidarComArquivoSelecionado(); // Executa a função para abrir o arquivo
      }

      if (event.ctrlKey && event.key === 'c') { // Verifica se Ctrl + D foi pressionado
        event.preventDefault(); // Impede o comportamento padrão do navegador
        console.log('Ctrl + C pressionado'); // Verifique se o evento está sendo capturado
        carregarDados(); // Executa a função
      }
    };

    // Adiciona o listener ao documento
    document.addEventListener('keydown', handleKeyDown);

    // Remove o listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingTypeOption, fileData]);

  const alterarNomeDoBanco = (event) => {
    setDatabaseName(event.target.value);
  };

  const testeConexao = async () => {
    console.log(`Tentando conectar ao banco: ${databaseName}`);
    setLoading(true);
    try {
      if (databaseName) {
        const result = await window.database.connect(databaseName);
        if (result) {
          if (result.success === true) {
            new window.Notification('Teste de conexão', {
              body: `Conexão realizada com sucesso!`,
              icon: logoTop,
            });
            textFieldBD.current.style.backgroundColor = '#86fc82';
            setConnectionStatus('Conectado com sucesso!');
            console.log(`Conectado com sucesso!`);
          } else {
            
            console.log(result.coderror);
            new window.Notification('Teste de conexão', {
              body: `Erro ao conectar ao banco!\n${result.error}`,
              silent: true,
              icon: logoTop,
            });
            textFieldBD.current.style.backgroundColor = '#ffa1a1';
            setConnectionStatus('Erro ao conectar ao banco!');
            console.log(`Erro ao conectar ao banco!\n${result.error}`);
            if (result.coderror === '28P01') {
              setDialogoinfo(true);
              console.log(dialogoinfo);
            }
          }
        } else {
          console.log('Deu erro no preload');
        }
        setConnectionStatus(`Conectado ao banco: ${databaseName}`);
      } else {
        setConnectionStatus('Por favor, digite um nome de banco de dados.');
      }
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogoinfo(false);
  };

  const lidarComArquivoSelecionado = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const carregarDados = () => {
    if (pendingTypeOption) {
      setLoading(true);
      setSelectedTypeOption(pendingTypeOption);
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
          setShowInsertData(true);
        }
      }, 1000);
    } else {
      alert('Informe se vai converter clientes ou produtos');
    }
  };

  const listConversao = ['Excel', 'Business', 'Control xhb', 'Control Postgres'];
  const tipoConversao = ['Clientes', 'Produtos'];

  const handleSelect = (option) => {
    setSelectedConversion(option);
    orientadorDisplayExcelRef.current.style.display = option === 'Excel' ? 'block' : 'none';
  };

  const handleSelectConversion = (option) => {
    setPendingTypeOption(option);
  };

  const alterStatus = (status) => {
    if (status === 'conectado') {
      textFieldBD.current.style.backgroundColor = '#86fc82';
      textFieldBD.current.focus();
    }else if (status === 'erro') {
      textFieldBD.current.style.backgroundColor = '#ffa1a1';
      textFieldBD.current.focus(); // Mantém o foco no input do banco de dados se der erro
    }else if (status === 'dialogo_fechado') {
      textFieldBD.current.focus();
    }
  };

  return (
    <DataContext.Provider value={data}>
      <div className="container">
        <Dropdown itensList={listConversao} nomeLabel={'Selecione o tipo de conversão'} onSelect={handleSelect} />

        <div id="orientador-display" ref={orientadorDisplayExcelRef}>
          <form className="form-group" onSubmit={(e) => e.preventDefault()}> {/* Impede o submit do formulário */}
            <div className="input-nome-banco">
              <label htmlFor="nomeBanco">BD que irá receber os dados</label>
              <input
                ref={textFieldBD}
                type="text"
                name="nomeBanco"
                id="nomeBanco"
                placeholder="Nome do Banco"
                onChange={alterarNomeDoBanco}
              />
            </div>
            <button type="button" id="testeConexao" onClick={testeConexao}>Testar conexão</button>
          </form>

          <div className="form-group-footer">
            <Dropdown itensList={tipoConversao} nomeLabel={'Dados a serem importados'} onSelect={handleSelectConversion} />
            <div onClick={lidarComArquivoSelecionado} id="buttonFilePath" style={{ backgroundColor: fileName ? '#86fc99' : '#F2F2F2' }}>
              <p>{fileName ? fileName : 'Selecione o caminho do excel'}</p>
              <img src={iconFolder} alt="Pasta" />
            </div>
            <button type="button" id="carregarDados" onClick={carregarDados}>Carregar dados</button>
            {loading && <Loading />} {/* Mensagem de carregamento */}
          </div>
        </div>
        {/* Componente que utilizará o contexto */}
        <DialogoInformacao isOpen={dialogoinfo} onClose={handleCloseDialog} isStatus={alterStatus} />
      </div>
    </DataContext.Provider>
  );
}