import * as React from "react";
import { useState } from "react";
import "./Formulario.css";
import SelectOption from "../SelectOption/SelectOption";


export default function Formulario() {
  const [opcaoSelecionadaConversor, setOpcaoSelecionadaConversor] = useState("");
  const [opcaoSelecionadaTabela, setOpcaoSelecionadaTabela] = useState("");
  const [opcaoViewConversor, setOpcaoViewConversor] = useState(""); // Para o texto do dropdown de conversor
  const [opcaoViewTabela, setOpcaoViewTabela] = useState(""); // Para o texto do dropdown de tabela

  const altSelecionada = (e, tipoDropdown) => {
    const valorSelecionado = e.target.getAttribute("data-value");
    const textoSelecionado = e.target.textContent;

    // Verifica de qual dropdown veio o clique
    if (tipoDropdown === "conversor") {
      setOpcaoSelecionadaConversor(valorSelecionado); // Atualiza valor do dropdown de conversão
      setOpcaoViewConversor(textoSelecionado); // Atualiza o texto do botão de conversão
    } else if (tipoDropdown === "tabela") {
      setOpcaoSelecionadaTabela(valorSelecionado); // Atualiza valor do dropdown de tabela
      setOpcaoViewTabela(textoSelecionado); // Atualiza o texto do botão de tabela
    }
    const orientador = document.getElementById('orientador-display');
    if(valorSelecionado === 'excel'){
        orientador.style.display = 'block';
    }else if(tipoDropdown==='tabela'){
        orientador.style.display = 'block';
    }else{
        orientador.style.display = 'none';
    }
  };


  const testeConexao  = () => {
    alert('Conexão realizada com sucesso!');

  }

  const optionsConversao = {
    "excel":  "Excel",
    "busines": "Business",
    "controlpg": "Control Postgres",
    "controlxhb":  "Control XHB"
  }

  const tipoConversao = {
    "cliente":  "Cliente",
    "produto" : "Produto",
  }

  return (
    <>
      <div className="container">
      <SelectOption options={optionsConversao}/>
      <SelectOption options={tipoConversao}/>
      <button>dada</button>
        <div className="dropdown">
          <button className="dropbtn">
            {opcaoViewConversor
              ? opcaoViewConversor
              : "Selecione o tipo de conversão"}
          </button>

          <div className="dropdown-content">
            <a
              href="#"
              data-value="excel"
              onClick={(e) => altSelecionada(e, "conversor")}
            >
              Excel
            </a>
            <a
              href="#"
              data-value="business"
              onClick={(e) => altSelecionada(e, "conversor")}
            >
              Business
            </a>
            <a
              href="#"
              data-value="controlpg"
              onClick={(e) => altSelecionada(e, "conversor")}
            >
              Control Postgres
            </a>
            <a
              href="#"
              data-value="controlXHB"
              onClick={(e) => altSelecionada(e, "conversor")}
            >
              Control XHB
            </a>
          </div>
        </div>
        {/* Aqui vai aparecer dependendo da opcao selecionada */}
        <div id="orientador-display">
          <form className="form-group">
            <input
              type="text"
              name="nomeBanco"
              id="nomeBanco"
              placeholder="Nome do Banco"
            />
            <button type="button" id="testeConexao" onClick={testeConexao}>Testar conexão</button>
          </form>
          <div className="form-group-footer">
            <div className="dropdown">
              <button className="dropbtn">
                {opcaoViewTabela ? opcaoViewTabela : "Dados a serem importados"}
              </button>
              <div className="dropdown-content">
                <a
                  href="#"
                  data-value="clientes"
                  onClick={(e) => altSelecionada(e, "tabela")}
                >
                  Clientes
                </a>
                <a
                  href="#"
                  data-value="produtos"
                  onClick={(e) => altSelecionada(e, "tabela")}
                >
                  Produtos
                </a>
              </div>
            </div>  
            <input type="file" name="caminhoExcel" id="caminhoExcel"/>

            <button type="button">Carregar dados</button>
          </div>
        </div>
      </div>
    </>
  );
}
