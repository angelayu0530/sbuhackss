import { Card, Stack, Text } from "@mantine/core";

export default function RemindersTab() {
	return (
		<Card withBorder radius="md" shadow="sm" p="lg">
			<Stack>
				<Text fw={600}>Reminders</Text>
				<Text size="sm" c="dimmed">No reminders yet. Add one to get started!</Text>
			</Stack>
		</Card>
	);
}
