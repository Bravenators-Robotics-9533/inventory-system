import { StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { BarCodeScanner } from 'expo-barcode-scanner';
import { server } from './ServerAPI';

import { ApplicationState } from "./ApplicationState"

export default function Login({ setApplicationState }) {

    const [hasScanned, setHasScanned] = useState(false);

    const onScan = useCallback(({data}) => {
        setHasScanned(true);

        server.post(`users/verify-token`, {
            tokenID: data
        }).then(res => {
            setApplicationState(new ApplicationState(data, res.data));
        }).catch(err => {
            console.log("Error" + err);
        })

    }, [setHasScanned, setApplicationState]);

    if(!hasScanned) {
        return (
            <View style={styles.loginView}>
                <Text style={styles.headerText}>Scan Tether Code to Continue</Text>
                <View style={styles.barcodeBox}>
                    <BarCodeScanner 
                    onBarCodeScanned={hasScanned ? undefined : onScan}
                    style={{height: 400, width: 400}} />
                </View>
            </View>
        )
    } else {
        return (
            <View style={styles.loginView}>
                <Text style={styles.headerText}>Syncing Theater with Server...</Text>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    loginView: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 40
    },
    barcodeBox: {
        backgroundColor: "tomato",
        alignItems: "center",
        justifyContent: "center",
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
    }
});