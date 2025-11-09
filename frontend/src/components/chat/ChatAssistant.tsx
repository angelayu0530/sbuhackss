import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Group, ThemeIcon, Title, Divider, ScrollArea, Stack, Text, TextInput, Button, ActionIcon } from "@mantine/core";
import { IconRobot, IconSend, IconTrash, IconCalendarPlus, IconReportMedical, IconBulb } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";
import { chatAPI } from "../../services/api";
import { useAuth } from "../../contexts/useAuth";

type Msg = { from: "ai" | "user"; text: string };

// Convert markdown to plain text
const stripMarkdown = (text: string): string => {
  return text
    // Remove bold **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic *text* or _text_
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove inline code `code`
    .replace(/`(.+?)`/g, '$1')
    // Remove headers # ## ###
    .replace(/^#{1,6}\s+/gm, '')
    // Remove links [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
    // Remove blockquotes
    .replace(/^\>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[\-\*\_]{3,}\s*$/gm, '')
    // Remove list markers
    .replace(/^[\-\*\+]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ')
    // Trim extra whitespace
    .trim();
};

export default function ChatAssistant({ lang }: { lang: Lang }) {
  const { user, patient } = useAuth();
  const t = useMemo(() => tDict[lang], [lang]);

  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = localStorage.getItem("chatHistory");
    return saved ? JSON.parse(saved) : [{ from: "ai", text: tDict.en.aiIntro }]; // fallback if no storage yet
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(messages));
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
      const data = await chatAPI.sendMessage(msg, patient?.pid, user?.uid);
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
    <Card
      withBorder
      radius="md"
      shadow="sm"
      p="lg"
      style={{
        position: "sticky",
        top: 88,
        background: 'linear-gradient(135deg, rgba(255, 245, 240, 0.7) 0%, rgba(248, 249, 255, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(111, 184, 213, 0.2)',
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon
            variant="gradient"
            gradient={{ from: "softPeach.5", to: "warmBlue.5", deg: 135 }}
            radius="md"
            size="lg"
          >
            <IconRobot size={20} />
          </ThemeIcon>
          <Title order={4} style={{ color: '#4a9ac0', fontWeight: 600 }}>{t.aiAssistant}</Title>
        </Group>
        <ActionIcon variant="subtle" color="red" onClick={clearChat} title="Clear chat history">
          <IconTrash size={18} />
        </ActionIcon>
      </Group>

      <Divider my="sm" />

      <ScrollArea
        h={420}
        viewportRef={chatRef}
        style={{
          border: "1px solid rgba(111, 184, 213, 0.2)",
          borderRadius: 12,
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <Stack p="sm">
          {messages.map((m, i) => (
            <Group key={i} justify={m.from === "user" ? "flex-end" : "flex-start"}>
              <Card
                radius="lg"
                padding="sm"
                withBorder={m.from === "ai"}
                style={{
                  background: m.from === "user"
                    ? "linear-gradient(135deg, #6fb8d5 0%, #5a9db8 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)",
                  color: m.from === "user" ? "white" : "#2c3e50",
                  maxWidth: "85%",
                  border: m.from === "ai" ? "1px solid rgba(111, 184, 213, 0.3)" : "none",
                  boxShadow: m.from === "user"
                    ? "0 2px 8px rgba(111, 184, 213, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Text size="sm" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {m.from === "ai" ? stripMarkdown(m.text) : m.text}
                </Text>
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
          styles={{
            input: {
              borderColor: 'rgba(111, 184, 213, 0.3)',
              '&:focus': {
                borderColor: '#6fb8d5',
              }
            }
          }}
        />
        <Button
          leftSection={<IconSend size={16} />}
          onClick={() => sendMessage()}
          loading={isLoading}
          variant="gradient"
          gradient={{ from: 'warmBlue.5', to: 'warmBlue.7', deg: 135 }}
        >
          {t.send}
        </Button>
      </Group>

      <Stack mt="sm" gap="xs">
        <Group gap="xs" grow>
          <Button
            variant="light"
            size="xs"
            onClick={() => sendMessage(t.translatePrescription)}
            color="warmBlue"
            styles={{ root: { background: 'rgba(111, 184, 213, 0.1)' } }}
          >
            {t.translatePrescription}
          </Button>
          <Button
            variant="light"
            size="xs"
            onClick={() => sendMessage(t.explainDiagnosis)}
            color="warmBlue"
            styles={{ root: { background: 'rgba(111, 184, 213, 0.1)' } }}
          >
            {t.explainDiagnosis}
          </Button>
          <Button
            variant="light"
            size="xs"
            onClick={() => sendMessage(t.askDoctor)}
            color="warmBlue"
            styles={{ root: { background: 'rgba(111, 184, 213, 0.1)' } }}
          >
            {t.askDoctor}
          </Button>
        </Group>

        <Divider
          label="AI Agent Actions"
          labelPosition="center"
          styles={{
            label: { color: '#4a9ac0', fontWeight: 600 }
          }}
        />

        <Group gap="xs" grow>
          <Button
            variant="gradient"
            gradient={{ from: 'warmBlue.5', to: 'warmBlue.7', deg: 135 }}
            size="xs"
            leftSection={<IconCalendarPlus size={14} />}
            onClick={() => sendMessage("Schedule an appointment for me")}
          >
            Create Event
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'calmLavender.5', to: 'calmLavender.7', deg: 135 }}
            size="xs"
            leftSection={<IconReportMedical size={14} />}
            onClick={() => sendMessage("Generate my health report")}
          >
            Health Report
          </Button>
        </Group>

        <Button
          variant="gradient"
          gradient={{ from: 'softPeach.5', to: 'softPeach.7', deg: 135 }}
          size="xs"
          leftSection={<IconBulb size={14} />}
          onClick={() => sendMessage("Recommend community events for health and wellness")}
          fullWidth
        >
          Recommend Events
        </Button>
      </Stack>
    </Card>
  );
}