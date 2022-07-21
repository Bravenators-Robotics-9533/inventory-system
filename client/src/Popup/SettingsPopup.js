import { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

import './Popup.css'
import './SettingsPopup.css'

export default function SettingsPopup({ isActive = false, setIsActive, theme, setTheme }) {

    const onClose = () => {
        setIsActive(false);
    }

    const Controls = {
        "General": (
            <>
            <div>
                <h3>Dark Theme</h3>
                <input type="checkbox" name="" id="" defaultChecked={theme === "dark"} onChange={(e) => { setTheme(e.target.checked ? "dark" : "light"); }} />
            </div>
            </>
        ),
        "Users": (
            <>
            <h1>Users</h1>
            </>
        )
    };

    const [currentState, setCurrentState] = useState("General");

    if(!isActive)
        return null;

    return (
        <section id="settings-popup" className="popup" key="Settings-Popup">
            <div className="box">
                <div className="header">
                    <h1>Settings</h1>
                    <FontAwesomeIcon icon={faX} className="fa-icon" onClick={onClose} />
                </div>
                <div className="content">
                    <div className="left">
                        <ul>
                            <li className={currentState === "General" ? `selected` : null} onClick={() => { setCurrentState("General") }}>General</li>
                            <li className={currentState === "Users" ? `selected` : null} onClick={() => { setCurrentState("Users") }}>Users</li>
                        </ul>
                    </div>
                    <div className="right">
                        {Controls[currentState]}
                    </div>
                </div>
            </div>
        </section>
    )

}