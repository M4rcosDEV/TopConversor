import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DropdownSearch.css';
import clearColuna from "../../assets/icons/borracha.png";

function DropdownSearch({ itensList, nomeLabel, onSelect, renderOption, descricoes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);
  const selectRef = useRef(null);
  const inputRef = useRef(null); // Referência para o input de busca

  const toggleDropdownSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm(''); // Limpa a pesquisa ao abrir
    }
  };

  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option);
    }
  };

  const filteredOptions = itensList.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Efeito para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        selectRef.current && !selectRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Efeito para focar no input de busca quando o dropdown é aberto
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus(); // Aplica o foco ao input de busca
    }
  }, [isOpen]); // Executa sempre que isOpen mudar

  const removeItem = () => {
    selectOption(null);
  };

  return (
    <div>
      <div className="dropdownSearch">
        <div className='complement-struct'>
          <div
            className={`select ${isOpen ? 'select-clicked' : ''}`}
            onClick={toggleDropdownSearch}
            ref={selectRef}
            aria-haspopup="true"
            aria-expanded={isOpen}
          >
            <span className="selected">
              {selectedOption || nomeLabel}
            </span>
            <div className={`caret ${isOpen ? 'caret-rotate' : ''}`}></div>
          </div>
          <img src={clearColuna} className="clear-option" onClick={removeItem} />
        </div>

        {isOpen && (
          <div className="dropdownSearch-menu" ref={menuRef}>
            <ul className={`menu ${isOpen ? 'menu-open' : ''}`}>
              <input
                ref={inputRef} // Referência para o input de busca
                type="text"
                className="search-input"
                placeholder="Digite o nome da coluna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    title={descricoes[option] || "Descrição não disponível"} // Adiciona o significado como tooltip
                    className={`option-item ${selectedOption === option ? 'selected' : ''}`}
                    onClick={() => selectOption(option)}
                  >
                    {renderOption ? renderOption(option) : option}
                  </li>
                ))
              ) : (
                <li className="no-options">Nenhuma coluna encontrada</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

DropdownSearch.propTypes = {
  itensList: PropTypes.arrayOf(PropTypes.string).isRequired,
  nomeLabel: PropTypes.string.isRequired,
  onSelect: PropTypes.func,
  renderOption: PropTypes.func,
  descricoes: PropTypes.objectOf(PropTypes.string), // Novo propType para descrições
};

export default DropdownSearch;