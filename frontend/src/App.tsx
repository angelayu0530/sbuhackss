import { useEffect, useMemo, useState } from "react";
import { AppShell, Container, Grid, Card, Tabs } from "@mantine/core";
import dayjs from "dayjs";
import { HeaderBar, Sidebar, WelcomeCard, WeekCalendar, MonthCalendarModal, RemindersTab, CommunityTab, ChatAssistant } from "./components";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import { AuthContext } from "./components/AuthContext";
import type { Lang } from "./lib/types";
import type { CalendarEvent, Task } from "./lib/types";
import { tDict } from "./lib/i18n";
import { IconChecklist, IconWorld } from "@tabler/icons-react";

export default function App() {
  // language
  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => tDict[lang], [lang]);

  // backend status
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");
  useEffect(() => {
    fetch("/api/")
      .then((r) => r.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  // mock data
  const doctor = {
    name: "Dr. Maria Rivera",
    phone: "(555) 123-4567",
    next: "March 5 • 2:00 PM",
    specialty: "Pediatrics",
    location: "Memorial Hospital, Floor 3",
  };
  const patient = {
    name: "Amina Seawolf",
    age: "8 years old",
    allergies: "Peanuts, Shellfish",
    meds: "Amoxicillin 250mg (2x daily)",
    notes: "Interpreter preferred (Spanish)",
  };

  // Events for calendar
  const weekStart = dayjs().startOf("week").add(1, "day"); // Monday
  const events: CalendarEvent[] = [
    { id: "e1", title: "PT check-in", start: weekStart.hour(10).minute(0), end: weekStart.hour(11).minute(0) },
    { id: "e2", title: "Pediatric Check-up", start: weekStart.add(2, "day").hour(14).minute(0), end: weekStart.add(2, "day").hour(15).minute(0) },
    { id: "e3", title: "Lab work", start: weekStart.add(3, "day").hour(9).minute(30), end: weekStart.add(3, "day").hour(10).minute(0) },
    { id: "e4", title: "Dental cleaning", start: weekStart.add(4, "day").hour(15).minute(30), end: weekStart.add(4, "day").hour(16).minute(30) },
    { id: "e5", title: "Care team call", start: weekStart.add(4, "day").hour(15).minute(45), end: weekStart.add(4, "day").hour(16).minute(15) },
  ];

  const [tasks, setTasks] = useState<Task[]>([
    { id: "walk", label: "Morning walk", time: "8:00 AM", done: false },
    { id: "meds", label: "Take medication", time: "9:00 AM", done: true },
    { id: "hydrate", label: "Drink water", time: "Throughout day", done: true },
    { id: "lunch", label: "Prepare lunch", time: "12:00 PM", done: false },
    { id: "exercise", label: "Physical therapy", time: "3:00 PM", done: false },
  ]);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showSignup, setShowSignup] = useState(false);

  if (!token) {
    return showSignup ? (
      <>
        <SignupPage onAuth={(t, u) => { setToken(t); setUser(u); }} />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setShowSignup(false)}>Already have an account? Log in</button>
        </div>
      </>
    ) : (
      <>
        <LoginPage onAuth={(t, u) => { setToken(t); setUser(u); }} />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button onClick={() => setShowSignup(true)}>Don't have an account? Sign up</button>
        </div>
      </>
    );
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken, setUser }}>
      <AppShell header={{ height: 64 }} padding="md">
        <HeaderBar lang={lang} setLang={setLang} apiStatus={apiStatus} />

        <AppShell.Main>
          <Container fluid p={0} style={{ maxWidth: 1400, marginInline: "auto" }}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Sidebar lang={lang} patient={patient} doctor={doctor} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 7 }}>
                <WelcomeCard lang={lang} setLang={setLang} />
                <WeekCalendar lang={lang} events={events} onOpenMonth={() => setCalendarOpen(true)} />

                <Card withBorder radius="md" shadow="sm" p="lg" mt="md">
                  <Tabs defaultValue="reminders" keepMounted={false}>
                    <Tabs.List>
                      <Tabs.Tab value="reminders" leftSection={<IconChecklist size={16} />}>
                        {t.reminders}
                      </Tabs.Tab>
                      <Tabs.Tab value="community" leftSection={<IconWorld size={16} />}>
                        {t.communityEvents}
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="reminders" pt="md">
                      <RemindersTab tasks={tasks} setTasks={setTasks} />
                    </Tabs.Panel>
                    <Tabs.Panel value="community" pt="md">
                      <CommunityTab />
                    </Tabs.Panel>
                  </Tabs>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <ChatAssistant lang={lang} />
              </Grid.Col>
            </Grid>
          </Container>
        </AppShell.Main>

        <MonthCalendarModal opened={calendarOpen} onClose={() => setCalendarOpen(false)} events={events} />
      </AppShell>
    </AuthContext.Provider>
  );
}
