import { View, ActivityIndicator, Text } from "react-native"

export default function FullPageLoader({ text }) {
    return (
        <View style={{width: "100%", height: "100%", alignItems: "center", justifyContent: "center"}}>
            <ActivityIndicator size="large" />
            {
                text &&
                <Text style={{marginTop: 20, fontSize: 20}}>{text}</Text>
            }
        </View>
    )
}