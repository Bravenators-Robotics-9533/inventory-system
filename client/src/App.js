import Projects from './Projects/Projects';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';

import { server } from './ServerAPI';
import { ApplicationState } from './ApplicationState';

import './App.css'

const defineThemeColor = (varName, definition) => {
    document.documentElement.style.setProperty(`--${varName}`, definition);
}

function App() {
    const [gsiScriptLoaded, setGsiScriptLoaded] = useState(false);

    const [applicationState, setApplicationState] = useState(null);
    const [theme, setTheme] = useState("dark");

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

    const handleCallbackResponse = useCallback((response) => {
        server.post('/users/login', {
            tokenID: response.credential
        }).then((res) => {
            setApplicationState(new ApplicationState(res.data.accessToken, res.data.user));
            ApplicationState.SaveSessionAccessToken(res.data.accessToken);
        });
    }, []);
 
    useEffect(() => {
        if(applicationState || gsiScriptLoaded) return;

        const initializeGsi = () => {
            if(!window.google || gsiScriptLoaded) return;

            setGsiScriptLoaded(true);
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCallbackResponse
            });
        }


        if(ApplicationState.IsUserRecoverable()) {
            const accessToken = ApplicationState.GetSessionSavedAccessToken();

            server.post('/users/verify-token', {
                tokenID: accessToken
            }).then((res) => {
                setApplicationState(new ApplicationState(accessToken, res.data));
            });
        } 

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.onload = initializeGsi;
        script.async = true;
        script.id = "google-client-script"
        document.querySelector("body")?.appendChild(script);

        return () => {
            window.google?.accounts.id.cancel();
            document.getElementById("google-client-script")?.remove();
        }
    }, [handleCallbackResponse, gsiScriptLoaded, applicationState]);

    return (
        <>
        <div id={`${theme}-theme`} className="master-wrapper">
            <div id="absolute-background"></div>
            { applicationState == null ?
            <div id="signInDiv" className="g_id_signin"></div>
            :
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="projects"/>} />
                    <Route path="projects/*" element={<Projects applicationState={applicationState} theme={theme} setTheme={setTheme} />} />
                    <Route path="*" element={<h1>NULL</h1>} />
                </Routes>
            </Router>
            }
        </div>
        </>
    );
}

export default App;