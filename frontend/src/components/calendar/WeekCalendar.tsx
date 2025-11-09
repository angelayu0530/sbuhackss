import { Card, Group, ThemeIcon, Title, Button, Divider, Box, Text } from "@mantine/core";
import { IconCalendar, IconArrowsMaximize } from "@tabler/icons-react";
import dayjs, { Dayjs } from "dayjs";
import type { Lang } from "../../lib/types";
import type { CalendarEvent } from "../../lib/types";
import { HOURS_START, HOURS_END, hoursArray, minutesFromDayStart } from "../../lib/types";
import { tDict } from "../../lib/i18n";
import { groupByDay, computeColumns } from "../../lib/calendar";

export default function WeekCalendar({
  lang,
  onOpenMonth,
  events,
  weekStart = dayjs().startOf("week").add(1, "day"), // Monday
}: {
  lang: Lang;
  onOpenMonth: () => void;
  events: CalendarEvent[];
  weekStart?: Dayjs;
}) {
  const t = tDict[lang];
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, "day"));
  const byDay = groupByDay(events);

  const now = dayjs();
  const isThisWeek =
    now.isAfter(weekStart.startOf("day")) && now.isBefore(weekStart.add(7, "day").endOf("day"));
  const nowMinutes = minutesFromDayStart(now);
  const totalMinutes = (HOURS_END - HOURS_START) * 60;

  return (
    <Card withBorder radius="md" shadow="sm" p="lg">
      <Group justify="space-between" mb="xs">
        <Group>
          <ThemeIcon variant="light" color="blue" radius="md"><IconCalendar size={20} /></ThemeIcon>
          <Title order={4}>{t.upcomingAppointments}</Title>
        </Group>
        <Button variant="light" size="xs" leftSection={<IconArrowsMaximize size={16} />} onClick={onOpenMonth}>
          {t.addToCalendar}
        </Button>
      </Group>
      <Divider my="sm" />

      {/* Header row */}
      <Box style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", gap: 0 }}>
        <Box />
        {days.map((d) => (
          <Box key={d.toString()} style={{ padding: "6px 8px", borderLeft: "1px solid var(--mantine-color-gray-3)" }}>
            <Text fw={700} size="sm">{d.format("ddd D")}</Text>
          </Box>
        ))}

        {/* Body */}
        <Box
          style={{
            gridColumn: "1 / span 8",
            display: "grid",
            gridTemplateColumns: "64px repeat(7, 1fr)",
            borderTop: "1px solid var(--mantine-color-gray-3)",
            position: "relative",
            maxHeight: 520,
            overflow: "auto",
          }}
        >
          {/* Hour gutter */}
          <Box style={{ borderRight: "1px solid var(--mantine-color-gray-3)" }}>
            {hoursArray().map((h) => (
              <Box key={h} style={{ height: 60, position: "relative" }}>
                <Text size="xs" c="dimmed" style={{ position: "absolute", top: -6, right: 8 }}>
                  {dayjs().hour(h).minute(0).format("h A")}
                </Text>
              </Box>
            ))}
          </Box>

          {/* Day columns */}
          {days.map((d) => {
            const key = d.format("YYYY-MM-DD");
            const dayEvents = computeColumns((byDay[key] || []).filter((e) => e.start.isSame(d, "day")));
            return (
              <Box
                key={key}
                style={{
                  borderLeft: "1px solid var(--mantine-color-gray-3)",
                  position: "relative",
                  background: d.isSame(dayjs(), "day") ? "var(--mantine-color-blue-0)" : "transparent",
                }}
              >
                {/* hour lines */}
                {hoursArray().map((_, i) => (
                  <Box key={i} style={{ height: 60, borderTop: "1px solid var(--mantine-color-gray-2)" }} />
                ))}

                {/* now line */}
                {isThisWeek && d.isSame(now, "day") && now.hour() >= HOURS_START && now.hour() <= HOURS_END && (
                  <Box
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--mantine-color-red-6)",
                      top: ((nowMinutes - HOURS_START * 60) / totalMinutes) * hoursArray().length * 60,
                    }}
                  />
                )}

                {/* events */}
                {dayEvents.map((ev) => {
                  const startM = Math.max(0, minutesFromDayStart(ev.start) - HOURS_START * 60);
                  const endM = Math.min((HOURS_END - HOURS_START) * 60, minutesFromDayStart(ev.end) - HOURS_START * 60);
                  const durationM = Math.max(30, endM - startM);
                  const top = (startM / 60) * 60;
                  const height = (durationM / 60) * 60;
                  const widthPct = 100 / ev.colCount;
                  const leftPct = ev.col * widthPct;

                  return (
                    <Card
                      key={ev.id}
                      radius="sm"
                      padding="xs"
                      style={{
                        position: "absolute",
                        top,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        height,
                        overflow: "hidden",
                        background: "var(--mantine-color-blue-5)",
                        color: "white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      <Text size="xs" fw={700}>
                        {ev.start.format("HH:mm")}–{ev.end.format("HH:mm")}
                      </Text>
                      <Text size="xs" lineClamp={2}>{ev.title}</Text>
                    </Card>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
