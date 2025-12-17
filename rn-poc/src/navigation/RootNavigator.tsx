import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useIsAuthenticated, usePassphraseAuth } from "jazz-tools/expo"
import AuthScreen from "../screens/AuthScreen"
import HomeScreen from "../screens/HomeScreen"
import TripTabNavigator from "./TripTabNavigator"
import wordlist from "~/lib/wordlist"
import { PassphraseAuth } from "jazz-tools"

export type RootStackParamList = {
  Auth: undefined
  Home: undefined
  Trip: { tripId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  const isAuthenticated = useIsAuthenticated()
  const passphraseAuth = usePassphraseAuth({ wordlist })
  console.log("passphrase", passphraseAuth.passphrase)

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ animationTypeForReplace: "pop" }}
          />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Trip" component={TripTabNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
