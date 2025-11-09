import { useEffect, useState } from "react";
import { Card, Group, Badge, Stack, Text, Button, TextInput, Modal, Textarea, Select, Input } from "@mantine/core";
import { tasksAPI } from "../../services/api";
import { useAuth } from "../../contexts/useAuth";
import { tDict } from "../../lib/i18n";
import type { Lang } from "../../lib/types";

type Task = { tid?: number; id: string; label: string; time: string; done: boolean; status?: string; priority?: string };

const RESET_KEY = "reminders_last_reset";
function shouldResetNow(now = Date.now()) {
  const last = Number(localStorage.getItem(RESET_KEY) || 0);
  return now - last >= 24 * 60 * 60 * 1000;
}
function markResetNow(now = Date.now()) {
  localStorage.setItem(RESET_KEY, String(now));
}

export default function RemindersTab({
  lang,
  tasks,
  setTasks,
}: {
  lang: Lang;
  tasks: Task[];
  setTasks: (fn: (t: Task[]) => Task[]) => void;
}) {
  const t = tDict[lang];
  const { user, patient, token } = useAuth();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [resetTime, setResetTime] = useState<string>("");
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_at: "",
  });

  const getNextResetTime = () => {
    const last = Number(localStorage.getItem(RESET_KEY) || 0);
    const nextReset = new Date(last + 24 * 60 * 60 * 1000);
    return nextReset.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    setResetTime(getNextResetTime());
    const interval = setInterval(() => {
      setResetTime(getNextResetTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!token || !patient) return;
      try {
        const backendTasks = await tasksAPI.list(token);
        if (Array.isArray(backendTasks)) {
          const formattedTasks = backendTasks
            .filter((t: { patient_id: number }) => t.patient_id === patient.pid)
            .map((t: { tid: number; title: string; due_at: string; status: string; priority: string }) => ({
              tid: t.tid,
              id: String(t.tid),
              label: t.title,
              time: t.due_at ? new Date(t.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "No time",
              done: t.status === "completed",
              status: t.status,
              priority: t.priority,
            }));
          setTasks(() => formattedTasks);
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
      }
    };
    load();
  }, [token, patient, setTasks]);

  useEffect(() => {
    if (shouldResetNow()) {
      setTasks((ts) => ts.map((t) => (t.status === "completed" ? t : { ...t, done: false })));
      markResetNow();
    }
    const id = setInterval(() => {
      if (shouldResetNow()) {
        setTasks((ts) => ts.map((t) => (t.status === "completed" ? t : { ...t, done: false })));
        markResetNow();
      }
    }, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, [setTasks]);

  const toggle = async (taskId: string, currentDone: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !token) return;

    const newStatus = !currentDone ? "completed" : "pending";

    try {
      await tasksAPI.update(parseInt(taskId), { status: newStatus }, token);
      setTasks((ts) =>
        ts.map((x) => (x.id === taskId ? { ...x, done: !x.done, status: newStatus } : x))
      );
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !user || !patient || !token) return;

    try {
      const response = await tasksAPI.create(
        {
          patient_id: patient.pid!,
          caretaker_id: user.uid,
          title: newTask.title,
          description: newTask.description || undefined,
          priority: (newTask.priority as "low" | "medium" | "high" | "urgent") || "medium",
          due_at: newTask.due_at || undefined,
          status: "pending",
        },
        token
      );

      if (response.tid) {
        const dueTime = newTask.due_at
          ? new Date(newTask.due_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "No time";
        
        setTasks((ts) => [
          ...ts,
          {
            tid: response.tid,
            id: String(response.tid),
            label: newTask.title,
            time: dueTime,
            done: false,
            status: "pending",
            priority: newTask.priority,
          },
        ]);
        setNewTask({ title: "", description: "", priority: "medium", due_at: "" });
        setIsAddingTask(false);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Button onClick={() => setIsAddingTask(true)} variant="light">
          {t.addReminder}
        </Button>
        <Text size="xs" c="dimmed">
          Resets at {resetTime}
        </Text>
      </Group>

      <Modal opened={isAddingTask} onClose={() => setIsAddingTask(false)} title={t.addReminder} size="md">
        <Stack gap="md">
          <TextInput
            label="Reminder *"
            placeholder="e.g., Take medication"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.currentTarget.value })}
            required
          />

          <Textarea
            label="Description"
            placeholder="Add more details about this reminder"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.currentTarget.value })}
            minRows={2}
          />

          <Input.Wrapper label="Due Date & Time">
            <Input
              type="datetime-local"
              value={newTask.due_at}
              onChange={(e) => setNewTask({ ...newTask, due_at: e.currentTarget.value })}
            />
          </Input.Wrapper>

          <Select
            label="Priority"
            placeholder="Select priority"
            data={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]}
            value={newTask.priority}
            onChange={(val) => setNewTask({ ...newTask, priority: val || "medium" })}
          />

          <Group justify="flex-end">
            <Button variant="light" onClick={() => setIsAddingTask(false)}>
              Cancel
            </Button>
            <Button onClick={addTask}>{t.addReminder}</Button>
          </Group>
        </Stack>
      </Modal>

      {tasks.map((task) => {
        const priorityColor: { [key: string]: string } = {
          low: "blue",
          medium: "yellow",
          high: "orange",
          urgent: "red",
        };
        
        return (
          <Card
            key={task.id}
            withBorder
            padding="md"
            radius="md"
            style={{ cursor: "pointer" }}
            onClick={() => toggle(task.id, task.done)}
          >
            <Group justify="space-between">
              <Group>
                <Badge color={task.done ? "teal" : "gray"} variant={task.done ? "filled" : "light"}>
                  {task.done ? "✓" : ""}
                </Badge>
                <Stack gap={2}>
                  <Text fw={600} c={task.done ? "dimmed" : undefined} td={task.done ? "line-through" : undefined}>
                    {task.label}
                  </Text>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      {task.time}
                    </Text>
                    {task.priority && (
                      <Badge size="sm" color={priorityColor[task.priority] || "gray"} variant="light">
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}
