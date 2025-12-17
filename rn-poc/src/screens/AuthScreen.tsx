import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native"
import { usePassphraseAuth } from "jazz-tools/expo"
import { wordlist } from "../providers/JazzProvider"

export default function AuthScreen() {
  const [name, setName] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [showPassphraseLogin, setShowPassphraseLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedPassphrase, setGeneratedPassphrase] = useState<string | null>(
    null,
  )

  const auth = usePassphraseAuth({ wordlist })

  const handleSignUp = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name")
      return
    }

    setIsLoading(true)
    try {
      const passphrase = await auth.signUp(name.trim())
      if (passphrase) {
        setGeneratedPassphrase(passphrase)
      }
    } catch (error) {
      Alert.alert("Error", "Failed to sign up. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!passphrase.trim()) {
      Alert.alert("Error", "Please enter your passphrase")
      return
    }

    setIsLoading(true)
    try {
      await auth.logIn(passphrase.trim())
    } catch (error) {
      Alert.alert("Error", "Invalid passphrase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (generatedPassphrase) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
          <View className="flex-1 justify-center">
            <Text className="text-3xl font-bold text-center text-foreground mb-4">
              Welcome! 🎉
            </Text>
            <Text className="text-lg text-center text-muted-foreground mb-8">
              Save your passphrase - you'll need it to log in on other devices.
            </Text>

            <View className="bg-muted p-4 rounded-xl mb-8">
              <Text className="text-lg font-mono text-center text-foreground">
                {generatedPassphrase}
              </Text>
            </View>

            <Text className="text-sm text-center text-muted-foreground mb-8">
              ⚠️ Keep this passphrase safe! It's the only way to access your
              account.
            </Text>

            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center"
              onPress={() => setGeneratedPassphrase(null)}
            >
              <Text className="text-white text-lg font-semibold">
                I've saved my passphrase
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center py-8">
          <Text className="text-4xl font-bold text-center text-foreground mb-2">
            🧭 kompass
          </Text>
          <Text className="text-lg text-center text-muted-foreground mb-12">
            Welcome to your travel planner
          </Text>

          {/* Sign Up Section */}
          <View className="mb-8">
            <Text className="text-xl font-semibold text-foreground mb-4">
              Create Account
            </Text>
            <TextInput
              className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-lg mb-4"
              placeholder="Your name"
              placeholderTextColor="#737373"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                isLoading ? "bg-primary/60" : "bg-primary"
              }`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-8">
            <View className="flex-1 h-px bg-border" />
            <Text className="px-4 text-muted-foreground">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Login Section */}
          <View>
            <Text className="text-xl font-semibold text-foreground mb-4">
              Already have an account?
            </Text>

            {showPassphraseLogin ? (
              <>
                <TextInput
                  className="bg-muted border border-border rounded-xl px-4 py-3 text-foreground text-lg mb-4"
                  placeholder="Enter your passphrase"
                  placeholderTextColor="#737373"
                  value={passphrase}
                  onChangeText={setPassphrase}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  className={`py-4 rounded-xl items-center mb-3 ${
                    isLoading ? "bg-primary/60" : "bg-primary"
                  }`}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-lg font-semibold">
                      Log In
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-2 items-center"
                  onPress={() => setShowPassphraseLogin(false)}
                >
                  <Text className="text-muted-foreground">Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                className="bg-muted border border-border py-4 rounded-xl items-center"
                onPress={() => setShowPassphraseLogin(true)}
              >
                <Text className="text-foreground text-lg font-semibold">
                  Log in with Passphrase
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
