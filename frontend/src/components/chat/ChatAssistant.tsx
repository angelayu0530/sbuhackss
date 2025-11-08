import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Group, ThemeIcon, Title, Divider, ScrollArea, Stack, Text, TextInput, Button } from "@mantine/core";
import { IconRobot, IconSend } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

type Msg = { from: "ai" | "user"; text: string };

export default function ChatAssistant({ lang }: { lang: Lang }) {
  const t = useMemo(() => tDict[lang], [lang]);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "ai", text: "Hello! I can translate, simplify terms, and draft messages to your doctor." },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    try {
      const res = await fetch("/api/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg, lang }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "ai", text: JSON.stringify(data) }]);
    } catch {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            from: "ai",
            text:
              lang === "en"
                ? "Here’s a demo reply: “Your message was received and translated.”"
                : lang === "zh"
                ? "示例回复：“已接收并完成翻译。”"
                : "Respuesta de ejemplo: “Tu mensaje fue recibido y traducido.”",
          },
        ]);
      }, 500);
    }
  };

  return (
    <Card withBorder radius="md" shadow="sm" p="lg" style={{ position: "sticky", top: 88 }}>
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon variant="gradient" gradient={{ from: "violet", to: "grape" }} radius="md">
            <IconRobot size={20} />
          </ThemeIcon>
          <Title order={4}>{t.aiAssistant}</Title>
        </Group>
      </Group>
      <Divider my="sm" />
      <ScrollArea h={420} viewportRef={chatRef} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 12 }}>
        <Stack p="sm">
          {messages.map((m, i) => (
            <Group key={i} justify={m.from === "user" ? "flex-end" : "flex-start"}>
              <Card
                radius="lg"
                padding="sm"
                withBorder={m.from === "ai"}
                style={{
                  background: m.from === "user" ? "var(--mantine-color-violet-6)" : "var(--mantine-color-white)",
                  color: m.from === "user" ? "white" : "inherit",
                  maxWidth: "85%",
                }}
              >
                <Text size="sm">{m.text}</Text>
              </Card>
            </Group>
          ))}
        </Stack>
      </ScrollArea>

      <Group mt="md" align="stretch">
        <TextInput
          placeholder={t.typeHere}
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconSend size={16} />} onClick={() => sendMessage()}>
          Send
        </Button>
      </Group>

      <Group mt="sm" gap="xs" grow>
        <Button variant="light" size="xs" onClick={() => sendMessage(t.translatePrescription)}>
          {t.translatePrescription}
        </Button>
        <Button variant="light" size="xs" onClick={() => sendMessage(t.explainDiagnosis)}>
          {t.explainDiagnosis}
        </Button>
        <Button variant="light" size="xs" onClick={() => sendMessage(t.askDoctor)}>
          {t.askDoctor}
        </Button>
      </Group>
    </Card>
  );
}
