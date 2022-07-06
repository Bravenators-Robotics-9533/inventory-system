import { useState, useEffect, useCallback } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom';

import { server, UserType } from './ServerAPI'

import './Projects.css'

export default function Projects({ applicationState }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);

    const [dbUser, setDbUser] = useState(null);
    const [projects, setProjects] = useState([]);

    const loadFromDB = useCallback(() => {
        if(applicationState) {
            // TODO: VALIDATE USER
            server.get(`/users/get/${applicationState.userID}`).then((res) => {
                setDbUser(res.data.user);
                
                server.get(`/projects/get-all`, {
                    headers: { authorization: applicationState.userID }
                }).then((res) => {
                    setProjects(res.data);
                    setIsReady(true);
                });
            });

            return;
        }

        navigation('/');
    }, [applicationState, navigation, setDbUser, setIsReady]);

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
            headers: { authorization: applicationState.userID }
        }).then((res) => {
            loadFromDB();
        })

    }, [applicationState, loadFromDB]);

    if(!isReady) 
        return null;

    return (
        <section id="projects">

            <div className="content">
                <div className="control-panel">
                    <div>
                        <h1>{applicationState.userName}</h1>
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
                    </div>
                </div>
                <ul>
                    {
                        projects.map((project) => {
                            return <li key={project._id}>{project.projectName}</li>
                        })
                    }
                </ul>
            </div>

        </section>
    );

}