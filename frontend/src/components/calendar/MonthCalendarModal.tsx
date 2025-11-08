import { Modal, Group, Text, Grid, Card, Stack, Divider, ActionIcon, Box, Button } from "@mantine/core";
import { IconCalendar, IconChevronLeft, IconChevronRight, IconCalendarEvent, IconX } from "@tabler/icons-react";
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

  // Selected day for detailed view
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);

  // Track previous opened state to detect when modal opens
  const [prevOpened, setPrevOpened] = useState(opened);

  useEffect(() => {
    // Only reset month when modal transitions from closed to open
    if (opened && !prevOpened) {
      setMonth(refMonth.startOf("month"));
      setSelectedDay(null);
    }
    setPrevOpened(opened);
  }, [opened, prevOpened, refMonth]);

  const grid = getMonthGrid(month);
  const byDay = groupByDay(events);

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = dayjs();
  const isCurrentMonth = today.isSame(month, "month");

  // Get events for selected day
  const selectedDayEvents = selectedDay
    ? (byDay[selectedDay.format("YYYY-MM-DD")] || []).sort((a, b) => a.start.valueOf() - b.start.valueOf())
    : [];

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
      <Box style={{ display: "flex", height: "calc(100vh - 120px)", gap: 16 }}>
        {/* Main calendar view */}
        <Box style={{ flex: selectedDay ? "0 0 65%" : "1 1 100%", overflow: "auto", transition: "flex 0.3s ease" }}>
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
              <Group gap="xs">
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => setMonth((m) => m.subtract(1, "month"))}
                  aria-label="Previous month"
                >
                  <IconChevronLeft size={20} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  size="lg"
                  onClick={() => setMonth((m) => m.add(1, "month"))}
                  aria-label="Next month"
                >
                  <IconChevronRight size={20} />
                </ActionIcon>
              </Group>
              <Text fw={600} size="lg">
                {month.format("MMMM YYYY")}
              </Text>
              <Button
                variant="light"
                size="sm"
                leftSection={<IconCalendarEvent size={16} />}
                onClick={() => setMonth(today.startOf("month"))}
                disabled={isCurrentMonth}
              >
                Today
              </Button>
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
              const isToday = d.isSame(today, "day");

              return (
                <Grid.Col key={key} span={12 / 7}>
                  <Card
                    withBorder
                    radius="md"
                    padding="sm"
                    h={180}
                    style={{
                      background: isToday
                        ? "var(--mantine-color-blue-1)"
                        : isOtherMonth
                          ? "var(--mantine-color-gray-0)"
                          : "white",
                      opacity: isOtherMonth ? 0.6 : 1,
                      borderColor: selectedDay?.isSame(d, "day")
                        ? "var(--mantine-color-blue-6)"
                        : isToday
                          ? "var(--mantine-color-blue-5)"
                          : undefined,
                      borderWidth: selectedDay?.isSame(d, "day") || isToday ? 2 : 1,
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedDay(d)}
                  >
                    <Group justify="space-between" mb={6}>
                      <Box
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text
                          fw={700}
                          size="sm"
                          c={isToday ? "blue" : isOtherMonth ? "dimmed" : undefined}
                        >
                          {d.format("D")}
                        </Text>
                        {isToday && (
                          <Box
                            style={{
                              background: "var(--mantine-color-blue-5)",
                              color: "white",
                              borderRadius: 4,
                              padding: "2px 6px",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            Today
                          </Box>
                        )}
                      </Box>
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

        {/* Detailed day view sidebar */}
        {selectedDay && (
          <Box
            style={{
              flex: "0 0 35%",
              borderLeft: "2px solid var(--mantine-color-gray-3)",
              paddingLeft: 16,
              overflow: "auto",
            }}
          >
            <Group justify="space-between" mb="md">
              <Box>
                <Text fw={700} size="lg">
                  {selectedDay.format("dddd")}
                </Text>
                <Text size="sm" c="dimmed">
                  {selectedDay.format("MMMM D, YYYY")}
                </Text>
              </Box>
              <ActionIcon
                variant="subtle"
                onClick={() => setSelectedDay(null)}
                aria-label="Close day view"
              >
                <IconX size={20} />
              </ActionIcon>
            </Group>

            <Divider mb="md" />

            {/* Timeline view */}
            <Box>
              {selectedDayEvents.length === 0 ? (
                <Card withBorder padding="lg" radius="md">
                  <Stack align="center" gap="xs">
                    <IconCalendarEvent size={32} stroke={1.5} color="var(--mantine-color-gray-5)" />
                    <Text size="sm" c="dimmed" ta="center">
                      No events scheduled for this day
                    </Text>
                  </Stack>
                </Card>
              ) : (
                <Stack gap="md">
                  {selectedDayEvents.map((ev, idx) => {
                    const isFirst = idx === 0;
                    const prevEvent = idx > 0 ? selectedDayEvents[idx - 1] : null;
                    const gap = prevEvent
                      ? ev.start.diff(prevEvent.end, "minute")
                      : null;

                    return (
                      <Box key={ev.id}>
                        {!isFirst && gap !== null && gap > 0 && (
                          <Text size="xs" c="dimmed" ta="center" my="xs">
                            {gap} min gap
                          </Text>
                        )}
                        <Card withBorder padding="md" radius="md" style={{ background: "var(--mantine-color-blue-0)" }}>
                          <Group justify="space-between" mb="xs">
                            <Text fw={700} size="md" c="blue">
                              {ev.start.format("h:mm A")}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {ev.end.format("h:mm A")}
                            </Text>
                          </Group>
                          <Text fw={600} mb="xs">
                            {ev.title}
                          </Text>
                          <Group gap="xs">
                            <Text size="xs" c="dimmed">
                              Duration: {ev.end.diff(ev.start, "minute")} minutes
                            </Text>
                          </Group>
                        </Card>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
