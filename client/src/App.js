import Login from './Login/Login';
import Projects from './Projects/Projects';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import { server } from './ServerAPI';
import { ApplicationState } from './ApplicationState';

import './App.css'

const defineThemeColor = (varName, definition) => {
    document.documentElement.style.setProperty(`--${varName}`, definition);
}

function App() {
    const [applicationState, setApplicationState] = useState(null);

    const [theme, setTheme] = useState("dark");
    // const toggleTheme = useCallback(() => { setTheme((currentTheme) => { return currentTheme === "light" ? "dark" : "light"})}, [setTheme]);

    // Check for application state should nullify
    useEffect(() => {

        if(applicationState && applicationState.shouldNullify()) {
            setApplicationState(null);
        }

    }, [applicationState, setApplicationState]);

    // On Theme Change
    useEffect(() => {
        if(theme === "light") {
            defineThemeColor("bg-color", "#f1f1f1");
            defineThemeColor("text-color", "#000000");
            defineThemeColor("offset-color", "#d1d1d1");
            defineThemeColor("offset-hover-color", "#f5f5f5");
        } else if(theme === "dark") {
            defineThemeColor("bg-color", "#141414");
            defineThemeColor("text-color", "#f1f1f1");
            defineThemeColor("offset-color", "#444444");
            defineThemeColor("offset-hover-color", "#303030");
        }

        defineThemeColor("red", "#ff0000");
        defineThemeColor("green", "#51ff51");
    }, [theme]);

    const processUserData = useCallback((data) => {
        const tokenID = data;
    
        server.post("/users/login", {
            userID: tokenID
        }).then((res) => { // Success
            setApplicationState(new ApplicationState(
                tokenID,
                res.data.user.userName,
                res.data.user.userType
            ));

            ApplicationState.SaveSessionAccessToken(tokenID);

        }).catch((error) => { // Failure
            if(error.response.status === 401) {
                console.log("Invalid User");
            }
        });
    }, [setApplicationState]);

    const attemptUserRecovery = useCallback(() => {

        const prevUserID = ApplicationState.GetSessionSavedAccessToken();

        if(prevUserID) {
            processUserData(prevUserID);
        } else {
            if(window.location.pathname !== '/')
                window.location = '/';
        }

    }, [processUserData]);

    const loginView = <Login applicationState={applicationState} processUserData={processUserData} attemptUserRecovery={attemptUserRecovery} />;
    const projectsView = <Projects applicationState={applicationState} attemptUserRecovery={attemptUserRecovery} theme={theme} setTheme={setTheme} />;

    return (
        <>
        <div id={`${theme}-theme`} className="master-wrapper">
            <div id="absolute-background"></div>
            <Router>
                <Routes>
                    <Route path="/" element={loginView} />
                    <Route path="projects/*" element={projectsView} />
                    <Route path="*" element={<h1>NULL</h1>} />
                </Routes>
            </Router>
        </div>
        </>
    );
}

export default App;