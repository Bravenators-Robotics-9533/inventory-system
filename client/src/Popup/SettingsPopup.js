import { useState, useEffect, useRef, useCallback } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faTrash, faX } from '@fortawesome/free-solid-svg-icons'

import './Popup.css'
import './SettingsPopup.css'
import { server } from '../ServerAPI'

export default function SettingsPopup({ applicationState, dbUser, isActive = false, setIsActive, theme, setTheme }) {
    
    const [shouldRecreate, setShouldRecreate] = useState(false);

    const [stateOptions, setStateOptions] = useState(null); 
    const [currentState, setCurrentState] = useState("General");

    const liSelections = useRef([]);

    const onClose = () => {
        setIsActive(false);
    }

    const resync = useCallback(() => {
        setShouldRecreate((curr) => { return !curr; })
    }, [setShouldRecreate])

    const createNewUser = useCallback(() => {
        const name = window.prompt("Enter User Name");

        if(!name)
            return;

        const userID = window.prompt("Enter User ID");

        if(!userID)
            return;

        server.put('/users/', {
            userName: name,
            userType: "Basic",
            userID: userID   
        }, {
            headers: { authorization: applicationState.userID }
        }).then(() => {
            resync();
        });
    }, [applicationState, resync]);

    const deleteUser = useCallback((user) => {
        server.delete(`/users/${user._id}`, {
            headers: { authorization: applicationState.userID }
        }).then((res) => {
            console.log(res)
            resync();
        })
    }, [applicationState, resync]);

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
                    <section id="users">
                        <ul>
                            <button onClick={createNewUser}>New User</button>
                            {
                                users.map((user) => {
                                    return (
                                    <li key={user._id}>
                                        <p>{user.userName}{user._id === dbUser._id ? " (me)" : null}</p>
                                        {
                                            user._id !== dbUser._id ?
                                            <select defaultValue={user.userType} onChange={() => {}} >
                                                <option value="Basic">Standard</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            : <span></span>
                                        }
                                        <span className="controls">
                                            <FontAwesomeIcon icon={faCopy} className="fa-icon" />
                                            {
                                                user._id !== dbUser._id ?
                                                <FontAwesomeIcon icon={faTrash} className="fa-icon" onClick={() => { deleteUser(user); }}/>
                                                : null
                                            }
                                        </span>
                                    </li>
                                    );
                                })
                            }
                        </ul>
                    </section>
                );
            }

            // Create LI Selections
            liSelections.current = [];
            for(let option in options) { liSelections.current.push(option); }
            setStateOptions(options);
        }

        if(shouldRecreate != null)
            call();
    }, [shouldRecreate, dbUser, setStateOptions, setTheme, theme, applicationState, deleteUser, createNewUser]);

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