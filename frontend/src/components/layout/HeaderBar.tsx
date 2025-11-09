import { AppShell, Group, Title, Box, Button, Badge } from "@mantine/core";
import { IconLogout, IconHeart } from "@tabler/icons-react";
import { useAuth } from "../../contexts/useAuth";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

export default function HeaderBar({
  lang = "en",
  setLang
}: {
  lang?: Lang;
  setLang?: (lang: Lang) => void;
}) {
  const { logout } = useAuth();
  const t = tDict[lang];

  return (
    <AppShell.Header
      style={{
        background: 'linear-gradient(90deg, rgba(255, 244, 207, 0.95) 0%, rgba(240, 249, 255, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(111, 184, 213, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      <Group justify="space-between" p="md">
        <Group gap="md">
          <Box
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ffa67f 0%, #6fb8d5 100%)',
              boxShadow: '0 4px 12px rgba(111, 184, 213, 0.3)'
            }}
          >
            <Title
              order={2}
              style={{
                color: 'white',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <IconHeart size={28} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              DemænCare
            </Title>
          </Box>
          <Badge
            variant="light"
            color="warmBlue"
            size="lg"
            style={{ fontWeight: 600 }}
          >
            Supporting Dementia Caregivers
          </Badge>
        </Group>
        <Group>
          <Button
            size="sm"
            variant="gradient"
            gradient={{ from: 'softPeach.5', to: 'softPeach.7', deg: 135 }}
            leftSection={<IconLogout size={16} />}
            onClick={logout}
            radius="md"
          >
            {t.logout}
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
}