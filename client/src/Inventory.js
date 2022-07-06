import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faRepeat, faPlus, faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'

import './Inventory.css'

const ValidInputRegex = /[0-9a-zA-Z]|Enter|Tab/g;

var keyLog = "";

// Allows us to bind and automatically unbind event listeners to DOM elements
const useEventListener = (eventName, handler, element = window) => {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);

        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
}

const processData = (data) => {
    console.log("Processing Data: \"" + data + "\"");
}

export default function Inventory({ applicationState }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);
    const [currentMode, setCurrentMode] = useState("add");

    const clearKeyLogInterval = useRef();

    // Verify User Login
    useEffect(() => {

        if(applicationState) {
            // Validate against server
            setIsReady(true);
            return;
        }

        navigation("/");
    }, [applicationState, navigation]);

    const keyDownHandler = ({ key }) => {
        if(key.match(ValidInputRegex)) {
            if(key === "Enter" || key === "Tab") { // Finish of Barcode
                if(keyLog.trim()) {
                    processData(keyLog);
                    clearInterval(clearKeyLogInterval.current);
                    keyLog = "";
                }
            } else {
                keyLog += key;

                // Clear key log after 500ms of nothing
                clearInterval(clearKeyLogInterval.current);
                clearKeyLogInterval.current = setInterval(() => {
                    keyLog = "";
                    clearInterval(clearKeyLogInterval.current);
                }, 10);
            }
        }

        // If not valid input key (do nothing)
    };

    const toggleCurrentMode = useCallback(() => {
        setCurrentMode((curr) => { return curr === "add" ? "remove" : "add"});
    }, [setCurrentMode]);

    useLayoutEffect(() => {
        clearInterval(clearKeyLogInterval.current);
    }, [clearKeyLogInterval]);

    useEventListener("keydown", keyDownHandler);

    let items = [];

    for(let i = 0; i < 100; i++) {
        items.push(<tr>
        <td>12-4-20</td>
        <td>879384985734</td>
        <td>Through Bore Bearing</td>
        <td>REV Robotics</td>
        <td>5</td>
    </tr>);
    }

    if(!isReady)
        return null;

    return (
        <section id="inventory" className={`${currentMode}-mode`}>
            <nav>
                <div className="controls"> 
                    <FontAwesomeIcon icon={faArrowRightFromBracket} className="fa-icon" onClick={() => { applicationState.logout(); }} />
                    <h1>{applicationState.userName}</h1>
                </div>
                <div className="controls">
                    <FontAwesomeIcon icon={faPlus} className="fa-icon" />
                    <FontAwesomeIcon icon={faRepeat} className="fa-icon" onClick={toggleCurrentMode} />
                    <FontAwesomeIcon icon={faGear} className="fa-icon" />
                </div>
            </nav>
            <div className="table-wrapper">
                <table>
                    <thead onClick={toggleCurrentMode}>
                        <tr>
                            <th>Date</th>
                            <th>Barcode</th>
                            <th>Name</th>
                            <th>Manufacturer</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>12-4-20</td>
                            <td>879384985734</td>
                            <td>Through Bore Bearing</td>
                            <td>REV Robotics</td>
                            <td>5</td>
                        </tr>
                        {items}
                    </tbody>
                </table>     
            </div>
        </section>
    );
}