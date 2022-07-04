import Inventory from './Inventory';
import Login from './Login';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';

import './App.css'

function App() {

    const [applicationState, setApplicationState] = useState(null);

    const [theme, setTheme] = useState("dark");
    const toggleTheme = useCallback(() => { setTheme((currentTheme) => { return currentTheme === "light" ? "dark" : "light"})}, [setTheme]);

    // Check for application state should nullify
    useEffect(() => {

        if(applicationState && applicationState.shouldNullify()) {
            setApplicationState(null);
        }

    }, [applicationState, setApplicationState]);

    const loginView = <Login applicationState={applicationState} setApplicationState={setApplicationState} />;
    const inventoryView = <Inventory applicationState={applicationState} />;

    return (
        <>
        <div id={`${theme}-theme`}>
            <div id="absolute-background"></div>
            <Router>
                <Routes>
                    <Route path="/" element={loginView} />
                    <Route path="inventory" element={inventoryView} />
                </Routes>
            </Router>
        </div>
        </>
    );
}

export default App;