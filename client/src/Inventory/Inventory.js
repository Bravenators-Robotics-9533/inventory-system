import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faPlus, faAngleLeft, faMagnifyingGlass, faCubesStacked, faCube } from '@fortawesome/free-solid-svg-icons'

import { server } from "../ServerAPI";

import { Outlet } from "react-router-dom";

import './Inventory.css'

import GenericItemList from "./GenericItemList";
import ErrorPopup from "./ErrorPopup";
import SettingsPopup from "../Popup/SettingsPopup"

import ActionUndoPopup from "./ActionUndoPopup";
import UniqueItemList from "./UniqueItemList";

const InventoryType = {
    Generic: "Generic",
    Unique: "Unique"
}

const ValidInputRegex = /[0-9a-zA-Z]|Enter|Tab|#|_/g;

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

export default function Inventory({ applicationState, projectID, dbUser, theme, setTheme }) {

    const navigation = useNavigate();

    const [isReady, setIsReady] = useState(false);
    const [project, setProject] = useState({inventoryItems: null});
    
    const [currentInventoryType, setCurrentInventoryType] = useState(InventoryType.Generic);

    const [isSearchDisplayed, setIsSearchDisplayed] = useState(false);
    const [currentSearchText, setCurrentSearchText] = useState(null);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);

    const actionUndoPopupRef = useRef();
    const errorPopupRef = useRef();

    const genericItemListRef = useRef();
    const uniqueItemListRef = useRef();
    
    const searchInputRef = useRef();
    
    const previousProjectData = useRef();

    const clearKeyLogInterval = useRef();
    const refreshInterval = useRef();

    const resyncProject = useCallback(() => {
        server.get(`/projects/get/${projectID}`, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            const projectData = JSON.stringify(res.data);

            if(projectData !== previousProjectData.current) {
                let rawProject = res.data;

                setProject(rawProject);
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
        if(currentInventoryType === InventoryType.Generic
            && genericItemListRef.current.isNewItemPopupActive()) // Ignore if in popup
            return;

        if(key.match(ValidInputRegex)) {
            if(key === "Enter" || key === "Tab") { // Finish of Barcode
                if(keyLog.trim()) {
                    if(currentInventoryType === InventoryType.Generic)
                        genericItemListRef.current.processData(keyLog);
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

    useLayoutEffect(() => {
        clearInterval(clearKeyLogInterval.current);
        clearInterval(refreshInterval.current);
    }, [clearKeyLogInterval]);

    useEventListener("keydown", keyDownHandler);

    if(!isReady)
        return null;

    return (
        <>
        <ActionUndoPopup ref={actionUndoPopupRef} />
        <ErrorPopup ref={errorPopupRef} />
        <SettingsPopup applicationState={applicationState} dbUser={dbUser} isActive={isSettingsVisible} setIsActive={setIsSettingsVisible} theme={theme} setTheme={setTheme} project={project} setProject={setProject} />

        <section id="inventory">
            <nav>
                <div className="controls"> 
                    <FontAwesomeIcon icon={faAngleLeft} className="fa-icon" onClick={() => { navigation('/projects'); }} />
                    <h1>{applicationState.user.userName}</h1>
                </div>
                <div className="itype-controls">
                    <FontAwesomeIcon className={`fa-icon ${currentInventoryType === InventoryType.Generic ? "selected" : undefined}`} icon={faCubesStacked} onClick={() => setCurrentInventoryType(InventoryType.Generic) } />
                    <h1>{project.projectName}</h1>
                    <FontAwesomeIcon className={`fa-icon ${currentInventoryType === InventoryType.Unique ? "selected" : undefined}`} icon={faCube} onClick={() => setCurrentInventoryType(InventoryType.Unique) } />
                </div>
                <div className="controls">
                    <FontAwesomeIcon icon={faPlus} className="fa-icon" onClick={() => {
                        if(currentInventoryType === InventoryType.Generic)
                            genericItemListRef.current.setIsNewItemPopupActive(true); 
                        else if(currentInventoryType === InventoryType.Unique)
                            uniqueItemListRef.current.createNewAsset();
                    }} />
                    <input type="text" name="part-search" className={isSearchDisplayed ? "displayed" : null} id="part-search" placeholder="Search..." ref={searchInputRef}
                    onChange={(e) => { setCurrentSearchText(e.target.value.toLowerCase()); }} />
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="fa-icon" onClick={() => { setIsSearchDisplayed((curr) => { 
                        if(curr) setCurrentSearchText(null);
                        else setCurrentSearchText(searchInputRef.current.value);

                        return !curr; 
                    })}} />
                    <FontAwesomeIcon icon={faGear} className="fa-icon" onClick={() => setIsSettingsVisible(true)} />
                </div>
            </nav>

            {
                currentInventoryType === InventoryType.Generic &&
                <GenericItemList ref={genericItemListRef} applicationState={applicationState} errorPopupRef={errorPopupRef} project={project} setProject={setProject} currentSearchText={currentSearchText} actionUndoPopupRef={actionUndoPopupRef} />
            }

            {
                currentInventoryType === InventoryType.Unique &&
                <UniqueItemList ref={uniqueItemListRef} applicationState={applicationState} project={project} setProject={setProject} />
            }
        </section>
        <Outlet />
        </>
    );
}