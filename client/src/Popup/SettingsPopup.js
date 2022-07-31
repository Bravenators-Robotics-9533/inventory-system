import { useState, useEffect, useRef, useCallback } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faTrash, faX, faPlus } from '@fortawesome/free-solid-svg-icons'

import './Popup.css'
import './SettingsPopup.css'
import { server } from '../ServerAPI'

import QRCode from "react-qr-code"

export default function SettingsPopup({ applicationState, dbUser, isActive = false, setIsActive, theme, setTheme, project = null, setProject = undefined }) {
    
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
            headers: { authorization: applicationState.accessToken }
        }).then(() => {
            resync();
        });
    }, [applicationState, resync]);

    const deleteUser = useCallback((user) => {
        if(!window.confirm("Are you sure you want to delete this user?"))
            return;

        server.delete(`/users/${user._id}`, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            console.log(res)
            resync();
        })
    }, [applicationState, resync]);

    const modifyUserType = useCallback((userID, type) => {
        if(!window.confirm("Are you sure you want to modify this user's permission level?"))
            return;

        server.post(`/users/set-type/${userID}`, {
            type: type
        }, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            resync();
        });
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
                    headers: { authorization: applicationState.accessToken }
                });

                const users = res.data;

                // Global Users
                options["Global Users"] = (
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
                                            <select defaultValue={user.userType} onChange={(e) => { modifyUserType(user._id, e.target.value) }} >
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

                options["Tethered Devices"] = (
                    <section id="tethered-devices">
                        <QRCode value={applicationState.accessToken} />
                    </section>
                )

                if(project != null) { // This Project

                    let projectAllowedUsers = [];

                    project.allowedUsers.forEach((user) => {
                        users.every(rawUser => {
                            if(user === rawUser._id) {
                                projectAllowedUsers.push(rawUser);
                                return false;
                            }

                            return true;
                        })
                    });

                    options["This Project"] = (
                        <section id="this-project">
                            <h1>Allowed Users</h1>
                            <ul className='users-list possible-users-list'>
                                {
                                    projectAllowedUsers.map(user => {
                                        return <li key={user._id}>
                                            {user.userName}
                                            <FontAwesomeIcon className="fa-icon" icon={faTrash} onClick={() => {
                                                server.post(`/projects/remove-user-from-project`, {
                                                    projectID: project._id,
                                                    targetUserID: user._id
                                                }, {
                                                    headers: { authorization: applicationState.accessToken }
                                                }).then((res) => {
                                                    setProject(res.data);
                                                })
                                            }} />
                                        </li>
                                    })
                                }
                            </ul>
                            <div className="divider"></div>
                            <h1>Possible Users</h1>
                            <ul className="users-list possible-users-list">
                                {
                                    users.map((user) => {
                                        let shouldReturn = false;

                                        projectAllowedUsers.every(iUser => {
                                            if(iUser._id === user._id) {
                                                shouldReturn = true;
                                                return false;
                                            }

                                            return true;
                                        })

                                        if(shouldReturn)
                                            return null;

                                        return (
                                        <li key={user._id}>
                                            <p>{user.userName}{user._id === dbUser._id ? " (me)" : null}</p>
                                            <FontAwesomeIcon className="fa-icon" icon={faPlus} onClick={() => {
                                                // Add User to Project + Resync
                                                server.put(`/projects/add-user-to-project`, {
                                                    projectID: project._id,
                                                    targetUserID: user._id
                                                }, {
                                                    headers: { authorization: applicationState.accessToken }
                                                }).then((res) => {
                                                    setProject(res.data);
                                                })
                                            }} />
                                        </li>
                                        );
                                    })
                                }
                            </ul>
                        </section>
                    )
                }
            }

            // Create LI Selections
            liSelections.current = [];
            for(let option in options) { liSelections.current.push(option); }
            setStateOptions(options);
        }

        if(shouldRecreate != null)
            call();
    }, [shouldRecreate, dbUser, setStateOptions, setTheme, theme, applicationState, deleteUser, modifyUserType, createNewUser, project, setProject]);

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