import { useState } from "react";
import { Container, Paper, PasswordInput, TextInput, Button, Title, Text, Tabs, Center, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { authAPI } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import type { User } from "../lib/types";

export default function Login() {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authAPI.login({
        email: loginEmail,
        password: loginPassword,
      });

      if (data.error) {
        setError(data.error);
      } else {
        const userData: User = data.user;
        login(userData, data.access_token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await authAPI.signup({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        phone: signupPhone || undefined,
      });

      if (data.error) {
        setError(data.error);
      } else {
        const userData: User = data.user;
        signup(userData, data.access_token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Container size="sm" py="xl">
        <Paper radius="md" p="xl" withBorder>
          <Center mb="xl">
            <Title order={1}>HealthBridge</Title>
          </Center>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              {error}
            </Alert>
          )}

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow>
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="signup">Sign Up</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="login" pt="md">
              <form onSubmit={handleLogin}>
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.currentTarget.value)}
                  mb="md"
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.currentTarget.value)}
                  mb="md"
                />
                <Button fullWidth type="submit" loading={isLoading}>
                  Login
                </Button>
              </form>
            </Tabs.Panel>

            <Tabs.Panel value="signup" pt="md">
              <form onSubmit={handleSignup}>
                <TextInput
                  label="Name"
                  placeholder="Your full name"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.currentTarget.value)}
                  mb="md"
                />
                <TextInput
                  label="Email"
                  placeholder="your@email.com"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.currentTarget.value)}
                  mb="md"
                />
                <TextInput
                  label="Phone (optional)"
                  placeholder="(555) 000-0000"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.currentTarget.value)}
                  mb="md"
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.currentTarget.value)}
                  mb="md"
                />
                <Button fullWidth type="submit" loading={isLoading}>
                  Sign Up
                </Button>
              </form>
              <Text size="sm" ta="center" mt="md" c="dimmed">
                After signing up, you'll be asked to enter patient information.
              </Text>
            </Tabs.Panel>
          </Tabs>
        </Paper>
      </Container>
    </div>
  );
}
