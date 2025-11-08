import { Card, Group, ThemeIcon, Title, Button } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict, languages } from "../../lib/i18n";

export default function WelcomeCard({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = tDict[lang];
  return (
    <Card withBorder radius="md" shadow="sm" mb="md" p="lg">
      <Group justify="space-between">
        <Group>
          <ThemeIcon variant="light" color="teal" radius="md"><IconUser size={20} /></ThemeIcon>
          <Title order={4}>{t.welcome}</Title>
        </Group>
        <Group gap="xs">
          {languages.map((l) => (
            <Button key={l} size="xs" variant={lang === l ? "filled" : "light"} onClick={() => setLang(l)}>
              {l === "zh" ? "中文" : l.toUpperCase()}
            </Button>
          ))}
        </Group>
      </Group>
    </Card>
  );
}
