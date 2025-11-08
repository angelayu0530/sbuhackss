import { Modal, Group, Text, Grid, Card, Stack, Divider } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import type { CalendarEvent } from "../../lib/types";
import { getMonthGrid, groupByDay } from "../../lib/calendar";

export default function MonthCalendarModal({
  opened,
  onClose,
  events,
  refMonth = dayjs(),
}: {
  opened: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  refMonth?: Dayjs;
}) {
  const grid = getMonthGrid(refMonth);
  const byDay = groupByDay(events);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      radius="md"
      title={
        <Group>
          <IconCalendar size={18} />
          <Text fw={600}>{refMonth.format("MMMM YYYY")}</Text>
        </Group>
      }
    >
      <Grid gutter="md">
        {grid.flat().map((d) => {
          const key = d.format("YYYY-MM-DD");
          const dayEvents = (byDay[key] || []).sort((a, b) => a.start.valueOf() - b.start.valueOf());
          const isOtherMonth = !d.isSame(refMonth, "month");

          return (
            <Grid.Col key={key} span={12 / 7}>
              <Card withBorder radius="md" padding="sm" h={180} style={{ background: isOtherMonth ? "var(--mantine-color-gray-0)" : "white" }}>
                <Group justify="space-between" mb={6}>
                  <Text fw={700} size="sm">{d.format("D")}</Text>
                </Group>
                <Divider my="xs" />
                {dayEvents.length === 0 ? (
                  <Text size="xs" c="dimmed">No items</Text>
                ) : (
                  <Stack gap={6}>
                    {dayEvents.map((ev) => (
                      <Card key={ev.id} withBorder radius="sm" padding="xs">
                        <Text fw={600} size="xs">
                          {ev.start.format("HH:mm")}–{ev.end.format("HH:mm")}
                        </Text>
                        <Text size="xs" c="dimmed">{ev.title}</Text>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </Modal>
  );
}
