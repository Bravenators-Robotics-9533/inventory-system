import { useState, useEffect, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faPlus, faGear } from '@fortawesome/free-solid-svg-icons'

import { Routes, Route } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

import { server, UserType } from '../ServerAPI'

import './Projects.css'
import Inventory from '../Inventory/Inventory';
import SettingsPopup from '../Popup/SettingsPopup';

export default function Projects({ applicationState, theme, setTheme }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);

    const [dbUser, setDbUser] = useState(null);
    const [projects, setProjects] = useState([]);

    const [isSettingsPopupActive, setIsSettingsPopupActive] = useState(false);

    const loadFromDB = useCallback(() => {
        if(applicationState) {
            server.get(`/users/get/${applicationState.user._id}`, {
                headers: { authorization: applicationState.accessToken }
            }).then((res) => {
                setDbUser(res.data.user);
                
                server.get(`/projects/get-all`, {
                    headers: { authorization: applicationState.accessToken }
                }).then((res) => {
                    setProjects(res.data);
                    setIsReady(true);
                }).catch((res) => {
                    const resStatus = res.response.status;
                                        
                    // Basic User
                    if(resStatus === 403) {
                        // TODO: Load allowed projects
                        setProjects([]);
                        setIsReady(true);
                    }
                })
            });

            return;
        }

        console.error("Could not identify user!!!");
    }, [applicationState, setDbUser, setIsReady]);

    // Verify User Login
    useEffect(() => {
        return loadFromDB();
    }, [loadFromDB]);

    const createNewProject = useCallback(() => {

        const projectName = window.prompt("Enter the project name: ");

        if(!projectName || projectName === "")
            return;

        server.post('/projects/create-new', {
            projectName: projectName
        }, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            loadFromDB();
        })

    }, [applicationState, loadFromDB]);

    const loadProject = (projectID) => {
        navigation(projectID)
    }

    if(!isReady) 
        return null;

    const projectsPageElement = (
        <>
        <SettingsPopup applicationState={applicationState} dbUser={dbUser} isActive={isSettingsPopupActive} setIsActive={setIsSettingsPopupActive} theme={theme} setTheme={setTheme}></SettingsPopup>
        <section id="projects">
            <div className="content">
                <div className="control-panel">
                    <div>
                        <h1>{applicationState.user.userName}</h1>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="fa-icon" onClick={() => { applicationState.logout(); }} />
                    </div>
                    <div>
                        {
                            dbUser.userType === UserType.Admin ?
                            <>
                            <FontAwesomeIcon icon={faPlus} className="fa-icon" onClick={() => { createNewProject(); }} />
                            </>
                            : null
                        }
                        <FontAwesomeIcon icon={faGear} className="fa-icon" onClick={() => { setIsSettingsPopupActive(true);} } />
                    </div>
                </div>
                <ul>
                    {
                        projects.map((project) => {
                            return <li key={project._id} onClick={() => { loadProject(project._id) }}>{project.projectName}</li>
                        })
                    }
                </ul>
            </div>
        </section>
        </>
    );

    return (
        <Routes>
            <Route path="/" element={projectsPageElement} />
            {
                projects.map((project) => {
                    return <Route key={project._id} path={`${project._id}`} 
                    element={<Inventory applicationState={applicationState} projectID={project._id} />} />
                })
            }
        </Routes>
    );

}