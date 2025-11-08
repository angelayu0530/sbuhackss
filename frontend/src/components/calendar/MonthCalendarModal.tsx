import { Modal, Group, Text, Grid, Card, Stack, Divider, ActionIcon, Box } from "@mantine/core";
import { IconCalendar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
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
  // Local month state for navigation
  const [month, setMonth] = useState<Dayjs>(() => refMonth.startOf("month"));

  // Track previous opened state to detect when modal opens
  const [prevOpened, setPrevOpened] = useState(opened);

  useEffect(() => {
    // Only reset month when modal transitions from closed to open
    if (opened && !prevOpened) {
      setMonth(refMonth.startOf("month"));
    }
    setPrevOpened(opened);
  }, [opened, prevOpened, refMonth]);

  const grid = getMonthGrid(month);
  const byDay = groupByDay(events);

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      radius="md"
      title={
        <Group>
          <IconCalendar size={18} />
          <Text fw={600}>Calendar</Text>
        </Group>
      }
    >
      <Box style={{ height: "calc(100vh - 120px)", overflow: "auto" }}>
        {/* Sticky header with month navigation and weekday names */}
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "white",
            paddingBottom: 12,
            borderBottom: "2px solid var(--mantine-color-gray-3)",
          }}
        >
          {/* Month navigation */}
          <Group justify="space-between" mb="md">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setMonth((m) => m.subtract(1, "month"))}
              aria-label="Previous month"
            >
              <IconChevronLeft size={20} />
            </ActionIcon>
            <Text fw={600} size="lg">
              {month.format("MMMM YYYY")}
            </Text>
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setMonth((m) => m.add(1, "month"))}
              aria-label="Next month"
            >
              <IconChevronRight size={20} />
            </ActionIcon>
          </Group>

          {/* Weekday header */}
          <Grid gutter={6}>
            {weekdayNames.map((wd) => (
              <Grid.Col key={wd} span={12 / 7}>
                <Box style={{ textAlign: "center", padding: "8px 4px" }}>
                  <Text fw={700} size="sm">
                    {wd}
                  </Text>
                </Box>
              </Grid.Col>
            ))}
          </Grid>
        </Box>

        {/* Calendar grid */}
        <Grid gutter="md" style={{ paddingTop: 12 }}>
          {grid.flat().map((d) => {
            const key = d.format("YYYY-MM-DD");
            const dayEvents = (byDay[key] || []).sort((a, b) => a.start.valueOf() - b.start.valueOf());
            const isOtherMonth = !d.isSame(month, "month");

            return (
              <Grid.Col key={key} span={12 / 7}>
                <Card
                  withBorder
                  radius="md"
                  padding="sm"
                  h={180}
                  style={{
                    background: isOtherMonth ? "var(--mantine-color-gray-0)" : "white",
                    opacity: isOtherMonth ? 0.6 : 1,
                  }}
                >
                  <Group justify="space-between" mb={6}>
                    <Text fw={700} size="sm" c={isOtherMonth ? "dimmed" : undefined}>
                      {d.format("D")}
                    </Text>
                  </Group>
                  <Divider my="xs" />
                  {dayEvents.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      No items
                    </Text>
                  ) : (
                    <Stack gap={6}>
                      {dayEvents.map((ev) => (
                        <Card key={ev.id} withBorder radius="sm" padding="xs">
                          <Text fw={600} size="xs">
                            {ev.start.format("HH:mm")}–{ev.end.format("HH:mm")}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {ev.title}
                          </Text>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Box>
    </Modal>
  );
}
