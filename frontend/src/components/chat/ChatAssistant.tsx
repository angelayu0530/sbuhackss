import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Group, ThemeIcon, Title, Divider, ScrollArea, Stack, Text, TextInput, Button, ActionIcon } from "@mantine/core";
import { IconRobot, IconSend, IconTrash } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";
import { chatAPI } from "../../services/api";

type Msg = { from: "ai" | "user"; text: string };

export default function ChatAssistant({ lang }: { lang: Lang }) {
  const t = useMemo(() => tDict[lang], [lang]);

  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [{ from: "ai", text: tDict.en.aiIntro }]; // fallback if no storage yet
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // persist + autoscroll
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // 🔁 when language changes, if the first message is the intro bubble, swap to localized text
  useEffect(() => {
    setMessages((m) => {
      if (m.length === 1 && m[0].from === "ai") {
        return [{ from: "ai", text: t.aiIntro }];
      }
      return m;
    });
  }, [t.aiIntro]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setMessages((m) => [...m, { from: "user", text: msg }]);
    setInput("");
    setIsLoading(true);
    try {
      const data = await chatAPI.sendMessage(msg);
      if (data.reply) {
        setMessages((m) => [...m, { from: "ai", text: data.reply }]);
      } else if (data.error) {
        setMessages((m) => [...m, { from: "ai", text: `Error: ${data.error}` }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [...m, { from: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    await chatAPI.clearHistory();
    const intro = t.aiIntro;
    const initial = [{ from: "ai", text: intro }] as Msg[];
    setMessages(initial);
    localStorage.setItem("chatHistory", JSON.stringify(initial));
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
        <ActionIcon variant="subtle" color="red" onClick={clearChat} title="Clear chat history">
          <IconTrash size={18} />
        </ActionIcon>
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
          disabled={isLoading}
          style={{ flex: 1 }}
        />
        <Button leftSection={<IconSend size={16} />} onClick={() => sendMessage()} loading={isLoading}>
          {t.send} {/* 🔁 translated */}
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
