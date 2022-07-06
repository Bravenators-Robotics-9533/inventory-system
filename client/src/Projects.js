import { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket, faPlus } from '@fortawesome/free-solid-svg-icons'

import { useNavigate } from 'react-router-dom';

import { server } from './ServerAPI'

import './Projects.css'

export default function Projects({ applicationState }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);

    const[dbUser, setDbUser] = useState(null);

    // Verify User Login
    useEffect(() => {
        if(applicationState) {
            // TODO: VALIDATE USER
            server.get(`/users/get/${applicationState.userID}`).then((res) => {
                setDbUser(res.data.user);
            });

            setIsReady(true);
            return;
        }

        navigation('/');
    }, [applicationState, navigation, setDbUser]);

    if(!isReady) 
        return null

    return (
        <section id="projects">

            <div className="content">
                <div className="control-panel">
                    <div>
                        <h1>{applicationState.userName}</h1>
                        <FontAwesomeIcon icon={faArrowRightFromBracket} className="fa-icon" onClick={() => { applicationState.logout(); }} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faPlus} className="fa-icon" onClick={() => {}} />
                    </div>
                </div>
                <ul>
                    <li>Test Element</li>
                    <li>Test Element</li>
                    <li>Test Element</li>
                    <li>Test Element</li>
                </ul>
            </div>

        </section>
    );

}