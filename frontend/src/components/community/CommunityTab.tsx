import { Stack, Card, Group, Text, Badge } from "@mantine/core";

export default function CommunityTab() {
  const items = [
    { title: "Free Health Fair", when: "Saturday, Mar 9 • 10:00 AM", location: "Community Center", tag: "EN/ES", color: "teal" },
    { title: "Nutrition Workshop", when: "Wednesday, Mar 13 • 6:00 PM", location: "Library Hall", tag: "EN/中文", color: "violet" },
    { title: "Language Support Group", when: "Thursday, Mar 14 • 5:00 PM", location: "Online (Zoom)", tag: "Multilingual", color: "yellow" },
    { title: "Caregiver Meetup", when: "Saturday, Mar 16 • 2:00 PM", location: "Park Pavilion", tag: "All welcome", color: "blue" },
  ];
  return (
    <Stack gap="sm">
      {items.map((c, i) => (
        <Card key={i} withBorder radius="md" padding="md">
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={600}>{c.title}</Text>
              <Text size="xs" c="dimmed">🕐 {c.when}</Text>
              <Text size="xs" c="dimmed">📍 {c.location}</Text>
            </Stack>
            <Badge color={c.color as any} variant="light">{c.tag}</Badge>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
