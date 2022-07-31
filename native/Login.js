import { StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

import { BarCodeScanner } from 'expo-barcode-scanner';

export default function Login({ }) {

    const [hasScanned, setHasScanned] = useState(false);

    const onScan = useCallback(({data}) => {
        setHasScanned(true);
    }, [setHasScanned]);

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