import React, { useState } from "react";
import { Button, TextInput, PasswordInput, Box, Text, Alert } from "@mantine/core";

export default function SignupPage({ onAuth }: { onAuth: (token: string, user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setSuccess(true);
      onAuth(data.access_token, data.user); // This will load the dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maw={340} mx="auto" mt={80}>
      <form onSubmit={handleSignup}>
        <TextInput
          label="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          mb="sm"
        />
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
        <TextInput
          label="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          mb="sm"
        />
        <Button type="submit" fullWidth loading={loading} mt="md">
          Sign Up
        </Button>
        {error && <Text color="red" mt="sm">{error}</Text>}
        {success && <Alert color="green" mt="sm">Signup successful! Redirecting...</Alert>}
      </form>
    </Box>
  );
}
