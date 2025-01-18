import React, { useState } from "react";
import "./UpdateViewer.css";
import updateIcon from "../../assets/icons/update_db.png";

const UpdateViewer = () => {
    const [isOpen, setIsOpen] = useState(false);

    const queries = {
        deleteData: `
            DELETE FROM tab_prod;
            DELETE FROM tab_grad;
            DELETE FROM tab_esto;
        `,
        fetchData: `
            SELECT * FROM tab_prod;
        `,
    };

    const handleQuery = async (queryKey) => {
        try {
            const query = queries[queryKey];
            if (!query) {
                console.error("Query não encontrada para a chave:", queryKey);
                return;
            }

            const result = await window.update.connect(query);
            if (result.success) {
                console.log(`Query "${queryKey}" executada com sucesso:`, result.result);
            } else {
                console.error(`Erro ao executar query "${queryKey}":`, result.error);
            }
        } catch (error) {
            console.error("Erro inesperado:", error);
        }
    };

    return (
        <>
            <div className="updates" onClick={() => setIsOpen(!isOpen)}>
                <div className="update-icon-container">
                    <img src={updateIcon} alt="Log Icon" className="update-icon" />
                </div>
            </div>

            {isOpen && (
                <div
                    className="update-container-descricao"
                    onClick={(e) => e.stopPropagation()} // Evita que o clique no contêiner feche
                >
                    <button
                        className="close-button"
                        onClick={() => setIsOpen(false)} // Fecha ao clicar no botão "X"
                    >
                        &times;
                    </button>
                    <h3>UPDATE</h3>
                    <p>DB Manutenção</p>

                    {/* Botões para executar diferentes queries */}
                    {/* Botões para executar diferentes queries */}
                    <div className="button-container">
                        <button className="query-button delete" onClick={() => handleQuery("deleteData")}>
                            Limpar Dados da Prod, Grad, Esto 
                        </button>
                        <button className="query-button fetch" onClick={() => handleQuery("fetchData")}>
                            Verificar Tipo de Pessoa
                            F ou PJ
                        </button>
                    </div>

                </div>
            )}
        </>
    );
};

export default UpdateViewer;
