import { AppShell, Group, Title, Box, Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useAuth } from "../../contexts/useAuth";

export default function HeaderBar() {
  const { logout } = useAuth();

  return (
    <AppShell.Header>
      <Group justify="space-between" p="md">
        <Group>
          <Box>
            <Title order={3}>Placeholder Name</Title>
          </Box>
        </Group>
        <Group>
          <Button size="sm" variant="filled" leftSection={<IconLogout size={14} />} onClick={logout}>
            {t.logout}
          </Button>
        </Group>
      </Group>
    </AppShell.Header>
  );
}
