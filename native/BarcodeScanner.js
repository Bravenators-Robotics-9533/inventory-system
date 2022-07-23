import { StyleSheet, Text, View, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useEffect, useState } from 'react';

export default function BarcodeScanner({}) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [text, setText] = useState("Not Scanned Yet");

    const askForCameraPermissions = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
    }

    // Request Camera Permission
    useEffect(() => {
        askForCameraPermissions();
    }, []);

    const handleBarCodeScanned = ({type, data}) => {
        setScanned(true);
        setText(data);
        console.log(`Type: ${type} \nData: ${data}`);
    }

    // Check Permissions and return the screens
    if(hasPermission === null) {
        return (
            <View>
                <Text>Requesting Camera Permission</Text>
            </View>
        )
    }

    if(hasPermission === false) {
        return (
            <View>
                <Text>Please Grant Camera Permission</Text>
                <Button text={"Allow Camera"} onPress={() => askForCameraPermissions} />
            </View>
        )
    }

    return (
        <View>
            <View style={styles.barcodebox}>
                <BarCodeScanner 
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={{height: 400, width: 400}}
                />
            </View>
            <Text style={styles.maintext}>{text}</Text>

            {scanned && <Button title={"Scan Again"} onPress={() => setScanned(false)} color="tomato" />}
        </View>
    )
}

const styles = StyleSheet.create({
    barcodebox: {
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'tomato'
    },
    maintext: {
        textAlign: "center",
        fontSize: 20,
        margin: 20
    }
})