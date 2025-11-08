import { AppShell, Group, Title, Text, Box, Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict, languages } from "../../lib/i18n";
import { useAuth } from "../../contexts/useAuth";

export default function HeaderBar({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  apiStatus: "online" | "offline" | "checking";
}) {
  const t = tDict[lang];
  const { logout } = useAuth();

  return (
    <AppShell.Header>
      <Group justify="space-between" p="md">
        <Group>
          <Box>
            <Title order={3}>Placeholder Name</Title>
          </Box>
        </Group>
          <Button size="sm" variant="filled" leftSection={<IconLogout size={14} />} onClick={logout}>
            Logout
          </Button>
        </Group>
    </AppShell.Header>
  );
}
