import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './DropdownSearch.css';

function DropdownSearch({ itensList, nomeLabel, onSelect, renderOption, desativados  }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);
  const selectRef = useRef(null);

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

  return (
    <div>
      <div className="dropdownSearch">
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
        {isOpen && (
          <div className="dropdownSearch-menu" ref={menuRef}>
            <ul className={`menu ${isOpen ? 'menu-open' : ''}`}>
              <input
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
                    className={`option-item ${selectedOption === option ? 'selected' : ''} ${
                      desativados.includes(option) ? 'disabled' : ''
                    }`}
                    onClick={() => !desativados.includes(option) && selectOption(option)}
                    style={{
                      cursor: desativados.includes(option) ? 'not-allowed' : 'pointer',
                      color: desativados.includes(option) ? 'red' : '#000',
                    }}
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
  desativados: PropTypes.arrayOf(PropTypes.string),
};

export default DropdownSearch;
