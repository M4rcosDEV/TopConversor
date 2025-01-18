import React, { useState, useEffect } from 'react';
import '../../App.jsx';
import sol from "../../assets/icons/sol.png";
import lua from "../../assets/icons/lua.png";
import updateIcon from "../../assets/icons/update_db.png";

const ThemeSwitcher = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Carrega o tema salvo ao iniciar
        const loadTheme = async () => {
            const savedTheme = await window.theme.load();
            setTheme(savedTheme);
            document.body.setAttribute('data-theme', savedTheme);
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
        await window.theme.save(newTheme); // Salva o novo tema
    };

    return (
        <>
        <div className="theme" onClick={toggleTheme}>
                        <div className="update-icon-container">
                            <img src={theme === 'light' ? lua : sol} alt="update Icon" className="update-icon" />
                        </div>
                    </div>

        {/* <button onClick={toggleTheme}>
            Alterar para {theme === 'light' ? 'Escuro' : 'Claro'}
        </button> */}
        </>
        
    );
};

export default ThemeSwitcher;
