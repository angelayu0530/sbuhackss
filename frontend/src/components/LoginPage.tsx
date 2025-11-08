import React, { useState } from "react";
import { Button, TextInput, PasswordInput, Box, Text } from "@mantine/core";

export default function LoginPage({ onAuth }: { onAuth: (token: string, user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onAuth(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maw={340} mx="auto" mt={80}>
      <form onSubmit={handleLogin}>
        <TextInput
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          mb="sm"
        />
        <PasswordInput
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          mb="sm"
        />
        <Button type="submit" fullWidth loading={loading} mt="md">
          Login
        </Button>
        {error && <Text color="red" mt="sm">{error}</Text>}
      </form>
    </Box>
  );
}
