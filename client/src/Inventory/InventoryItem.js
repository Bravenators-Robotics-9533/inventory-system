import { useEffect, useState } from "react";

export default function InventoryItem({ barcode, name, manufacturer, quantity, searchQuery }) {

    const [shouldDisplay, setShouldDisplay] = useState(true);
    const [nameElement, setNameElement] = useState(null);

    useEffect(() => {

        if(searchQuery && !name.toLowerCase().includes(searchQuery)) {
            setShouldDisplay(false);
        } else {
            if(!searchQuery || searchQuery === null) {
                setNameElement(<td>{name}</td>);
            } else {
                let replacedString = name.replace(new RegExp(`${searchQuery}`, 'gi'), function replace(match) {
                    return `<span class="highlighted">${match}</span>`;
                });

                setNameElement(<td dangerouslySetInnerHTML={{__html: replacedString}}></td>);
            }

            setShouldDisplay(true);
        }

    }, [searchQuery, name, setShouldDisplay]);

    if(!shouldDisplay)
        return null;

    return (
        <tr>
            <td>{barcode}</td>
            {nameElement}
            <td>{manufacturer}</td>
            <td>{quantity}</td>
        </tr>
    );
}