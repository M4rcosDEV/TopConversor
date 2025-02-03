import React, {useState, useRef, useEffect } from "react";
import './DialogoInformacao.css';
import close from "../../assets/icons/closeDialogo.svg";
import { Dialog } from 'primereact/dialog';

export default function DialogoInformacao({ isOpen, onClose, isStatus }) {
  const container_dialogo = useRef(null);
  const passwordText = useRef(null);
  const [visible, setVisible] = useState(false);
  

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && isOpen) { // Verifica se a tecla pressionada é "Enter" e se o diálogo está aberto
        sendPassword(); // Chama a função sendPassword
      }
      if (event.key === 'Escape' && isOpen && !visible) { // Verifica se a tecla pressionada é "Esc" e se o diálogo está aberto
        isStatus('dialogo_fechado');  
        onClose(); // Fecha o diálogo
      }
    };

    // Adiciona o listener ao documento
    document.addEventListener('keydown', handleKeyDown);

    // Remove o listener quando o componente é desmontado
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, visible]); // Adiciona isOpen e onClose como dependências
  const sendPassword = async () => {
    try {
      const result = await window.alterarSenha.alterPassword(passwordText.current.value);
      if (result.success === true) {
        console.log('Conectado pai');
        isStatus('conectado');
        onClose(); 
      } else {
        console.log('Erro ao conectar');
        
        // Se o alerta já estiver visível, não reabre
        if (!visible) {
          setVisible(true);
        }
  
        passwordText.current.value = '';
        passwordText.current.focus(); // Mantém o foco no input
      }
    } catch (error) {
      console.error('Erro ao tentar alterar a senha:', error);
    }
  };
  

  const handleClose = (e) => {
    e.stopPropagation(); // Impede que o evento de clique se propague
    onClose(); // Fecha o diálogo
    isStatus('dialogo_fechado');
  };

  const handleclick = () => {
    setVisible(false);
    passwordText.current.focus();
  }

  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter" && visible) { // Só fecha se o alerta estiver aberto
        setVisible(false);
        passwordText.current.focus(); // Mantém o foco no campo de senha
      }
    };
  
    document.addEventListener("keydown", handleEnterPress);
    
    return () => {
      document.removeEventListener("keydown", handleEnterPress);
    };
  }, [visible]); // Só atualiza quando o alerta muda de estado
  

  return (
    <>
      {visible && (
          <div className="alert-backdrop" onClick={handleclick}>
            <div className="alert-container-descricao" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setVisible(false)}>&times;</button>
              <h3>Erro</h3>
              <p>Senha ou nome do banco de dados está incorreto</p>
            </div>
          </div>
        )}
      {isOpen ? (
        <div className="container-dialogo" ref={container_dialogo}>
          <p className="informacao">
            Nosso sistema detectou que o Postgres não está com a senha nativa configurada. Por favor, informe a senha do Postgres para prosseguir.
          </p>

          <main className="input-senha-banco">
            <input 
              ref={passwordText} 
              type="password" 
              name="passwordText" 
              id="passwordText" 
              placeholder="Senha do banco" 
              autoFocus // Adiciona foco automático ao input
            />
          </main>

          <footer className="footer-dialogo">
            <button className="btn-ok" onClick={sendPassword}>Ok</button>

            <button className="btn-close" onClick={handleClose}>Fechar</button>
          </footer>

        </div>
      ) : null}
    </>
  );
}