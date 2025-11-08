import { AppShell, Group, Title, Text, ThemeIcon, Box, Button, Badge } from "@mantine/core";
import type { Lang } from "../../lib/types";
import { tDict, languages } from "../../lib/i18n";

export default function HeaderBar({
  lang,
  setLang,
  apiStatus,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  apiStatus: "online" | "offline" | "checking";
}) {
  const t = tDict[lang];
  return (
    <AppShell.Header>
      <Group justify="space-between" p="md">
        <Group>
          <ThemeIcon variant="gradient" gradient={{ from: "teal", to: "green" }} radius="md" size="lg">
            H
          </ThemeIcon>
          <Box>
            <Title order={3}>HealthBridge</Title>
            <Text size="xs" c="dimmed">{t.caregiverDashboard}</Text>
          </Box>
        </Group>
        <Group gap="xs">
          {languages.map((l) => (
            <Button key={l} size="xs" variant={lang === l ? "filled" : "light"} onClick={() => setLang(l)}>
              {l === "zh" ? "中文" : l.toUpperCase()}
            </Button>
          ))}
          <Badge color={apiStatus === "online" ? "teal" : apiStatus === "offline" ? "red" : "gray"} variant="light">
            API {apiStatus}
          </Badge>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
