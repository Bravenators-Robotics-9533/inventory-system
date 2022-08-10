import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Login from './Login';
import EntryStack from './routes/EntryStack';

export default function App() {

    const [applicationState, setApplicationState] = useState(null);

    if(!applicationState) {
        return (
            <View style={styles.container}>
                <Login setApplicationState={setApplicationState} />
                <StatusBar style="auto" />
            </View>
        );
    }
    else {
        return (
            <EntryStack screenProps={{applicationState: applicationState}} />
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
