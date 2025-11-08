import { useEffect } from "react";
import { Card, Group, Badge, Stack, Text } from "@mantine/core";

type Task = { id: string; label: string; time: string; done: boolean };

const RESET_KEY = "reminders_last_reset";
function shouldResetNow(now = Date.now()) {
  const last = Number(localStorage.getItem(RESET_KEY) || 0);
  return now - last >= 24 * 60 * 60 * 1000;
}
function markResetNow(now = Date.now()) {
  localStorage.setItem(RESET_KEY, String(now));
}

export default function RemindersTab({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: (fn: (t: Task[]) => Task[]) => void;
}) {
  useEffect(() => {
    if (shouldResetNow()) {
      setTasks((ts) => ts.map((t) => ({ ...t, done: false })));
      markResetNow();
    }
    const id = setInterval(() => {
      if (shouldResetNow()) {
        setTasks((ts) => ts.map((t) => ({ ...t, done: false })));
        markResetNow();
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [setTasks]);

  const toggle = (id: string) =>
    setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  return (
    <Stack gap="xs">
      {tasks.map((task) => (
        <Card key={task.id} withBorder padding="md" radius="md" style={{ cursor: "pointer" }} onClick={() => toggle(task.id)}>
          <Group justify="space-between">
            <Group>
              <Badge color={task.done ? "teal" : "gray"} variant={task.done ? "filled" : "light"}>
                {task.done ? "✓" : ""}
              </Badge>
              <Stack gap={2}>
                <Text fw={600} c={task.done ? "dimmed" : undefined} td={task.done ? "line-through" : undefined}>
                  {task.label}
                </Text>
                <Text size="xs" c="dimmed">{task.time}</Text>
              </Stack>
            </Group>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
