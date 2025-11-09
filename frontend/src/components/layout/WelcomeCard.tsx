import { Card, Group, ThemeIcon, Title, Button, Text } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict, languages } from "../../lib/i18n";

export default function WelcomeCard({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const t = tDict[lang];
  return (
    <Card
      withBorder
      radius="xl"
      shadow="md"
      mb="md"
      p="xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 166, 127, 0.1) 0%, rgba(111, 184, 213, 0.1) 100%)',
        borderColor: 'rgba(111, 184, 213, 0.3)'
      }}
    >
      <Group justify="space-between">
        <Group>
          <ThemeIcon
            variant="gradient"
            gradient={{ from: 'softPeach.3', to: 'warmBlue.5', deg: 135 }}
            radius="xl"
            size="lg"
          >
            <IconHeart size={24} />
          </ThemeIcon>
          <div>
            <Title order={3} style={{ color: '#4a9ac0', fontWeight: 700 }}>
              {t.welcome}
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              You're doing an amazing job. Take care of yourself too. 💙
            </Text>
          </div>
        </Group>
        <Group gap="xs">
          {languages.map((l) => (
            <Button
              key={l}
              size="sm"
              variant={lang === l ? "gradient" : "light"}
              gradient={lang === l ? { from: 'warmBlue.5', to: 'warmBlue.7', deg: 135 } : undefined}
              onClick={() => setLang(l)}
              radius="md"
            >
              {l === "zh" ? "中文" : l.toUpperCase()}
            </Button>
          ))}
        </Group>
      </Group>
    </Card>
  );
}
