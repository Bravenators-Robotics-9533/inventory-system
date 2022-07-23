import { useState, useEffect, useRef } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

import './Popup.css'
import './SettingsPopup.css'
import { server } from '../ServerAPI'

export default function SettingsPopup({ applicationState, dbUser, isActive = false, setIsActive, theme, setTheme }) {
    
    const [stateOptions, setStateOptions] = useState(null); 
    const [currentState, setCurrentState] = useState("General");

    const liSelections = useRef([]);

    const onClose = () => {
        setIsActive(false);
    }

    useEffect(() => {
        const call = async () => {
            let options = {};

            // General
            options["General"] = (
                <div>
                    <h3>Dark Theme</h3>
                    <input type="checkbox" name="" id="" defaultChecked={theme === "dark"} onChange={(e) => { setTheme(e.target.checked ? "dark" : "light"); }} />
                </div>
            );

            if(dbUser.userType === "Admin") {
                const res = await server.get('/users/get-all', {
                    headers: { authorization: applicationState.userID }
                });

                const users = res.data;

                options["Users"] = (
                    <ul>
                        {
                            users.map((user) => {
                                return <li key={user._id}>{user.userName}</li>
                            })
                        }
                    </ul>
                );
            }

            // Create LI Selections
            liSelections.current = [];
            for(let option in options) { liSelections.current.push(option); }
            setStateOptions(options);
        }

        call();
    }, [dbUser, setStateOptions, setTheme, theme, applicationState]);

    if(!isActive || !stateOptions)
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
                            {
                                liSelections.current.map((selection) => {
                                    return (
                                        <li key={selection} className={currentState === selection ? `selected` : null} onClick={() => { setCurrentState(selection) }}><p>{selection}</p></li>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="right">
                        {stateOptions[currentState]}
                    </div>
                </div>
            </div>
        </section>
    )

}