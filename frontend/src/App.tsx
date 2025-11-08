import { useEffect, useMemo, useState } from "react";
import { AppShell, Container, Grid, Card, Tabs, Loader, Center } from "@mantine/core";
import dayjs from "dayjs";
import { HeaderBar, Sidebar, WelcomeCard, WeekCalendar, MonthCalendarModal, RemindersTab, CommunityTab, ChatAssistant, Login, PatientRegistrationModal } from "./components";
import type { Lang, CalendarEvent } from "./lib/types";
import { tDict } from "./lib/i18n";
import { IconChecklist, IconWorld } from "@tabler/icons-react";
import { useAuth } from "./contexts/useAuth";

export default function App() {
  const { user, patient, isLoading: authLoading, isNewSignup } = useAuth();
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    if (user && !patient && isNewSignup) {
      setShowPatientModal(true);
    }
  }, [user, patient, isNewSignup]);

  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => tDict[lang], [lang]);

  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");
  useEffect(() => {
    fetch("http://localhost:5001/")
      .then((r) => r.json())
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const doctor = {
    name: "Dr. Maria Rivera",
    phone: "(555) 123-4567",
    next: "March 5 • 2:00 PM",
    specialty: "Pediatrics",
    location: "Memorial Hospital, Floor 3",
  };

  // Use patient data from auth context if available
  const patientData = patient || {
    name: "Amina Seawolf",
    age: 8,
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

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tasks, setTasks] = useState([
    { id: "walk", label: "Morning walk", time: "8:00 AM", done: false },
    { id: "meds", label: "Take medication", time: "9:00 AM", done: true },
    { id: "hydrate", label: "Drink water", time: "Throughout day", done: true },
    { id: "lunch", label: "Prepare lunch", time: "12:00 PM", done: false },
    { id: "exercise", label: "Physical therapy", time: "3:00 PM", done: false },
  ]);

  if (authLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <AppShell header={{ height: 64 }} padding="md">
        <HeaderBar lang={lang} setLang={setLang} apiStatus={apiStatus} />

        <AppShell.Main>
          <Container fluid p={0} style={{ maxWidth: 1400, marginInline: "auto" }}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Sidebar lang={lang} patient={patientData} doctor={doctor} />
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

      <PatientRegistrationModal opened={showPatientModal} onClose={() => setShowPatientModal(false)} />
    </>
  );
}
