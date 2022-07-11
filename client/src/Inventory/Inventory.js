import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faRepeat, faPlus, faAngleLeft } from '@fortawesome/free-solid-svg-icons'

import { server } from "../ServerAPI";

import { Outlet } from "react-router-dom";

import './Inventory.css'

import InventoryItem from "./InventoryItem";

import Popup from "../Popup/Popup";
import PopupInputField from "../Popup/PopupInputField"

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

export default function Inventory({ applicationState, projectID }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);
    const [project, setProject] = useState(null);

    const [currentMode, setCurrentMode] = useState("add");
    const [isNewItemPopupActive, setIsNewItemPopupActive] = useState(true);

    const previousProjectData = useRef();
    const clearKeyLogInterval = useRef();
    const refreshInterval = useRef();

    const resyncProject = useCallback(() => {
        server.get(`/projects/get/${projectID}`, {
            headers: { authorization: applicationState.userID }
        }).then((res) => {
            const projectData = JSON.stringify(res.data);

            if(projectData !== previousProjectData.current) {
                setProject(res.data);
                setIsReady(true);

                previousProjectData.current = projectData;
            }
        })
    }, [setIsReady, setProject, applicationState, projectID]);

    // Verify User Login
    useEffect(() => {
        
        clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(resyncProject, 5000); // 5 seconds

        resyncProject();

    }, [resyncProject]);

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

    const createNewItemBarcodeFieldRef = useRef();
    const createNewItemManufacturerFieldRef = useRef();
    const createNewItemItemNameFieldRef = useRef();
    const createNewItemStartingQuantityFieldRef = useRef();

    const createNewItem = () => {
        const barcode = createNewItemBarcodeFieldRef.current.value;
        const manufacturer = createNewItemManufacturerFieldRef.current.value;
        const itemName = createNewItemItemNameFieldRef.current.value;
        const startingQuantity = createNewItemStartingQuantityFieldRef.current.value;

        console.log("Creating new item!");
    }

    useLayoutEffect(() => {
        clearInterval(clearKeyLogInterval.current);
        clearInterval(refreshInterval.current);
    }, [clearKeyLogInterval]);

    useEventListener("keydown", keyDownHandler);

    if(!isReady)
        return null;

    return (
        <>
        <Popup isActive={isNewItemPopupActive} popupName="Create Item" submitButtonName="Create" onClose={() => { setIsNewItemPopupActive(false); }} 
        onSubmit={createNewItem}>
            <PopupInputField key="Barcode" name="Barcode" ref={createNewItemBarcodeFieldRef} />
            <PopupInputField key="Manufacturer" name="Manufacturer" ref={createNewItemManufacturerFieldRef} />
            <PopupInputField key="Item Name" name="Item Name" ref={createNewItemItemNameFieldRef} />
            <PopupInputField key="Starting Quantity" name="Starting Quantity" startingValue={0} style={{width: "4em", textAlign: "center"}} 
            ref={createNewItemStartingQuantityFieldRef} type="number" customValidationCallback={() => {
                const value = createNewItemStartingQuantityFieldRef.current.value;
                return Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) >= 0
            }} />
        </Popup>

        <section id="inventory" className={`${currentMode}-mode`}>
            <nav>
                <div className="controls"> 
                    <FontAwesomeIcon icon={faAngleLeft} className="fa-icon" onClick={() => { navigation('/projects'); }} />
                    <h1>{applicationState.userName}</h1>
                </div>
                <h1>{project.projectName}</h1>
                <div className="controls">
                    <FontAwesomeIcon icon={faPlus} className="fa-icon" onClick={() => { setIsNewItemPopupActive(true); }} />
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
                        {
                            project.inventoryItems.map((item) => {
                                return <InventoryItem />
                            })
                        }
                    </tbody>
                </table>     
            </div>
        </section>
        <Outlet />
        </>
    );
}