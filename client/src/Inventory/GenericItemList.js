import { useState, useEffect, forwardRef, useRef, useImperativeHandle, useCallback } from "react";

import { server } from "../ServerAPI";

import useSound from "use-sound";
import { addItemSound, removeItemSound } from "../Sound/Sound";

import Popup from "../Popup/Popup";

import InventoryItem from "./InventoryItem";
import PopupInputField from "../Popup/PopupInputField";

const GenericItemList = forwardRef(({ applicationState, errorPopupRef, project, setProject, currentSearchText, actionUndoPopupRef }, ref) => {

    const [currentMode, setCurrentMode] = useState("add");

    const [inventoryItemElements, setInventoryItemElements] = useState([]);

    const [isNewItemPopupActive, setIsNewItemPopupActive] = useState(false);
    
    const createNewItemBarcodeFieldRef = useRef();
    const createNewItemManufacturerFieldRef = useRef();
    const createNewItemItemNameFieldRef = useRef();
    const createNewItemStartingQuantityFieldRef = useRef();

    const [playAddItemSound] = useSound(addItemSound, { volume: 0.5 });
    const [playRemoveItemSound] = useSound(removeItemSound, { volume: 0.5 });

    const updateInventoryItem = useCallback((barcode, data) => {
        server.post(`/projects/update-item`, {
            projectID: project._id,
            itemBarcode: barcode,
            itemData: data
        }, {
            headers: { authorization: applicationState.accessToken }
        }).then((res) => {
            setProject(res.data.project);
        })
    }, [project, applicationState, setProject]);

    const createNewItem = useCallback(() => {
        const barcode = createNewItemBarcodeFieldRef.current.value;
        const manufacturer = createNewItemManufacturerFieldRef.current.value;
        const itemName = createNewItemItemNameFieldRef.current.value;
        const startingQuantity = createNewItemStartingQuantityFieldRef.current.value;

        if(project.inventoryItems[barcode]) {
            return;
        }

        updateInventoryItem(barcode, { name: itemName, manufacturer: manufacturer, quantity: startingQuantity });
    }, [project, updateInventoryItem]);

    const modifyItemQuantity = useCallback((barcode, value) => {
        server.post(`/projects/modify-item-quantity`, {
            projectID: project._id,
            itemBarcode: barcode,
            value: value
        }, {
            headers: { authorization: applicationState.accessToken } 
        }).then((res) => {
            if(value > 0) {
                playAddItemSound();
            } else {
                playRemoveItemSound();
            }

            setProject(res.data.project);

            // Reversal of this action
            actionUndoPopupRef.current.handleChange(barcode, value, () => {
                server.post(`/projects/modify-item-quantity`, {
                    projectID: project._id,
                    itemBarcode: barcode,
                    value: -(value)
                }, {
                    headers: { authorization: applicationState.accessToken } 
                }).then((res) => {
                    setProject(res.data.project);
                });
            });
        }).catch(err => {
            const clientErrorCode = err?.response?.data?.clientErrorCode;

            if(!clientErrorCode)
                return;

            if(clientErrorCode === 1) {
                console.log("Unknown Item!");
            } else if(clientErrorCode === 2) { // Attempting to change quantity to less than 0
                errorPopupRef.current.runError("Invalid Item Quantity", "Item quantity is already 0. Maybe you meant to add it?");
            }
        });
    }, [project, applicationState, setProject, playAddItemSound, playRemoveItemSound, actionUndoPopupRef, errorPopupRef]);

    const toggleCurrentMode = useCallback(() => {
        setCurrentMode((curr) => { return curr === "add" ? "remove" : "add"});
    }, [setCurrentMode]);

    useImperativeHandle(ref, () => ({
        processData(data) {
            if((data.startsWith("Shift#") || data.startsWith("#")) && data.endsWith("#")) {

                let specialData = data.split('#')[1];
    
                if(specialData === "MODE_ADD") {
                    setCurrentMode("add")
                } else if(specialData === "MODE_REMOVE") {
                    setCurrentMode("remove");
                }
    
                return;
            }
    
            if(currentMode === "add") {
                modifyItemQuantity(data, 1);            
            } else if(currentMode === "remove") {
                modifyItemQuantity(data, -1);
            }
        },

        createNewItem() {
            const barcode = createNewItemBarcodeFieldRef.current.value;
            const manufacturer = createNewItemManufacturerFieldRef.current.value;
            const itemName = createNewItemItemNameFieldRef.current.value;
            const startingQuantity = createNewItemStartingQuantityFieldRef.current.value;
    
            if(project.inventoryItems[barcode]) {
                return;
            }
    
            updateInventoryItem(barcode, { name: itemName, manufacturer: manufacturer, quantity: startingQuantity });
        },

        isNewItemPopupActive() { return isNewItemPopupActive; },
        setIsNewItemPopupActive(value) { setIsNewItemPopupActive(value); },
    }));

    useEffect(() => {
        
        let elements = [];

        for(let element in project.inventoryItems) {
            const itemData = project.inventoryItems[element];
            elements.push({element: element, itemData: itemData});
        }

        setInventoryItemElements(elements);

    }, [project.inventoryItems, setInventoryItemElements]);

    return (
        <>
            <Popup isActive={isNewItemPopupActive} popupName="Create Item" submitButtonName="Create" onClose={() => { setIsNewItemPopupActive(false); }} 
            onSubmit={createNewItem}>
                <PopupInputField key="Barcode" name="Barcode" ref={createNewItemBarcodeFieldRef} oneline />
                <PopupInputField key="Manufacturer" name="Manufacturer" ref={createNewItemManufacturerFieldRef} oneline />
                <PopupInputField key="Item Name" name="Item Name" ref={createNewItemItemNameFieldRef} oneline />
                <PopupInputField key="Starting Quantity" name="Starting Quantity" oneline startingValue={0} style={{width: "4em", textAlign: "center"}} 
                ref={createNewItemStartingQuantityFieldRef} type="number" customValidationCallback={() => {
                    const value = createNewItemStartingQuantityFieldRef.current.value;
                    return Number.isInteger(Number.parseInt(value)) && Number.parseInt(value) >= 0
                }} />
            </Popup>

            <div className="table-wrapper" id="generic-item-list">
                <table className={currentMode}>
                    <thead onClick={toggleCurrentMode}>
                        <tr>
                            <th>Barcode</th>
                            <th>Name</th>
                            <th>Manufacturer</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            inventoryItemElements.map((element) => {
                                return <InventoryItem key={element.element} barcode={element.element} searchQuery={currentSearchText} 
                                {...element.itemData} />
                            })
                        }
                    </tbody>
                </table>     
            </div>
        </>
    )

});

export default GenericItemList;