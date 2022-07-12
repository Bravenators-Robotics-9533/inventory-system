export default function InventoryItem({ barcode, name, manufacturer, quantity }) {
    return (
        <tr>
            <td>{barcode}</td>
            <td>{name}</td>
            <td>{manufacturer}</td>
            <td>{quantity}</td>
        </tr>
    );
}