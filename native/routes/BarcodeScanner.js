import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner'
import { useEffect, useState } from 'react';

export default function BarcodeScanner({}) {

    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scanData, setScanData] = useState("Not Scanned Yet");

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
        setScanData(data);
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
        <View style={styles.container}>
            <SafeAreaView>
                <View>
                    {/* <Text style={styles.maintext}>Scanning...</Text> */}
                    <View style={styles.barcodebox}>
                        {
                            !scanned ? 
                            <BarCodeScanner 
                            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                            style={{height: 400, width: 400}}
                            />
                            :
                            <Button title={"Scan Again"} onPress={() => setScanned(false)} color="tomato" />
                        }
                    </View>
                </View>
                <View style={styles.bottomView}>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    barcodebox: {
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: '#ffb861',
        marginTop: 30
    },
    maintext: {
        textAlign: "center",
        fontSize: 20,
        margin: 20
    },
    container: {
        alignItems: 'center',
        justifyContent: "space-between",
        height: "100%"
    }
})