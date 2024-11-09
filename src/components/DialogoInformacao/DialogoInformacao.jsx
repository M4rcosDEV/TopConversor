import React, { useRef } from "react";
import './DialogoInformacao.css';
import close from "../../assets/icons/closeDialogo.svg";

export default function DialogoInformacao({ isOpen, onClose, isStatus }) {
  const container_dialogo = useRef(null);
  const passwordText = useRef(null);

    const sendPassword = async()=>{
        // implementação da lógica para enviar a senha
        const result = await window.alterarSenha.alterPassword(passwordText.current.value);
        if(result.success ===  true){
            console.log('Conectado pai')
            isStatus('conectado')
            onClose();
        }
    }

  return (
    <>
      {isOpen ? (
        <div className="container-dialogo" ref={container_dialogo}>
          <p className="informacao">
            Nosso sistema detectou que o Postgres não está com a senha nativa configurada. Por favor, informe a senha do Postgres para prosseguir.
          </p>

          <main className="input-senha-banco">
            <input ref={passwordText} type="password" name="passwordText" id="passwordText" placeholder="Senha do banco" />
          </main>

          <footer className="footer-dialogo">
            <button className="btn-ok"  onClick={sendPassword}>Ok</button>

            <button className="btn-close" onClick={(e) => { e.stopPropagation(); onClose(); }}>Fechar</button>
          </footer>
        </div>
      ) : null}
    </>
  );
}
