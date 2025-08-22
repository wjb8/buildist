import { useState } from "react";
import { Alert } from "react-native";
import { View } from "./View";
import { Text } from "./Text";
import { Button } from "./Button";
import { Input } from "./Input";
import { colors, spacing, layoutStyles } from "@/styles";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const VALID_CREDENTIALS = {
  username: "admin",
  password: "admin",
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate a brief delay for better UX
    setTimeout(() => {
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        onLoginSuccess();
      } else {
        setError("Invalid username or password");
        setPassword("");
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handleInputChange = (field: "username" | "password", value: string) => {
    setError("");
    if (field === "username") {
      setUsername(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <View
      center
      style={[layoutStyles.flex, layoutStyles.p4, { backgroundColor: colors.background.primary }]}
    >
      <View style={[layoutStyles.mb6, { alignItems: "center" }]}>
        <Text variant="h1" style={[layoutStyles.mb2]}>
          Buildist
        </Text>
        <Text variant="h3" color="neutral" center>
          Asset Management Tool
        </Text>
        <Text variant="body" color="neutral" center style={[layoutStyles.mt2]}>
          Phase 1: Road Infrastructure Demo
        </Text>
      </View>

      <View style={[layoutStyles.mb6, { width: "100%", maxWidth: 300 }]}>
        <Input
          label="Username"
          value={username}
          onChangeText={(value) => handleInputChange("username", value)}
          placeholder="Enter username"
          autoCapitalize="none"
          autoCorrect={false}
          style={[layoutStyles.mb4]}
          fullWidth
        />

        <Input
          label="Password"
          value={password}
          onChangeText={(value) => handleInputChange("password", value)}
          placeholder="Enter password"
          secureTextEntry
          style={[layoutStyles.mb4]}
          fullWidth
        />

        {error ? (
          <Text color="error" variant="bodySmall" center style={[layoutStyles.mb4]}>
            {error}
          </Text>
        ) : null}

        <Button
          variant="primary"
          onPress={handleLogin}
          disabled={isSubmitting}
          style={[layoutStyles.mb4]}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>

        <Text variant="caption" color="neutral" center>
          Demo Credentials: admin / admin
        </Text>
      </View>

      <View style={[layoutStyles.mt4]}>
        <Text variant="bodySmall" color="neutral" center>
          Offline-First Asset Management
        </Text>
        <Text variant="caption" color="neutral" center style={[layoutStyles.mt1]}>
          All data stored locally on device
        </Text>
      </View>
    </View>
  );
}
