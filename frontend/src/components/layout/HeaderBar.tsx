import { AppShell, Group, Title, Box, Button, Select } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
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
    <AppShell.Header>
      <Group justify="space-between" p="md">
        <Group>
          <Box>
            <Title order={3}>Placeholder Name</Title>
          </Box>
        </Group>
        <Group>
          <Button 
            size="sm" 
            variant="filled" 
            leftSection={<IconLogout size={14} />} 
            onClick={logout}
          >
            {t.logout}
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
}