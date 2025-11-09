import { useEffect, useMemo, useState, useCallback } from "react";
import { AppShell, Container, Grid, Card, Tabs, Loader, Center } from "@mantine/core";
import dayjs from "dayjs";
import { HeaderBar, Sidebar, WelcomeCard, WeekCalendar, MonthCalendarModal, RemindersTab, CommunityTab, AnalyticsTab, ChatAssistant, Login, PatientRegistrationModal } from "./components";
import Settings from "./pages/Settings";
import type { Lang, CalendarEvent } from "./lib/types";
import { tDict } from "./lib/i18n";
import { IconChecklist, IconWorld, IconDeviceMobile, IconChartLine } from "@tabler/icons-react";
import { useAuth } from "./contexts/useAuth";
import { appointmentsAPI, type Appointment } from "./services/api";
import PatientDisplaySettings from "./components/patient-display/PatientDisplaySettings";
import PatientAlerts from "./components/PatientAlerts";


export default function App() {
  const { user, patient, isLoading: authLoading, isNewSignup } = useAuth();
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const patientData = patient || {
    name: "Amina Seawolf",
    age: 8,
    allergies: "Peanuts, Shellfish",
    meds: "Amoxicillin 250mg (2x daily)",
    notes: "Interpreter preferred (Spanish)",
  };

  // Events from appointments
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Fetch appointments from backend
  const fetchAppointments = useCallback(async () => {
    try {
      const appointments: Appointment[] = await appointmentsAPI.list();
      const calendarEvents: CalendarEvent[] = appointments
        .filter(apt => apt.active)
        .map(apt => ({
          id: apt.aid.toString(),
          title: apt.location || "Appointment",
          start: dayjs(apt.start_time),
          end: dayjs(apt.end_time),
        }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  }, []);

  // Fetch appointments on mount
  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);

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
  if (showSettings) {
    return (
      <AppShell header={{ height: 64 }} padding="md">
        <HeaderBar lang={lang} setLang={setLang} />
        <AppShell.Main>
          <Settings onBack={() => setShowSettings(false)} />
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <>
      {/* Patient Alert System - Background component */}
      <PatientAlerts caregiverId={user?.uid} />

      <AppShell header={{ height: 64 }} padding="md">
        <HeaderBar lang={lang} setLang={setLang} />
        <AppShell.Main>
          <Container fluid p={0} style={{ maxWidth: 1400, marginInline: "auto" }}>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Sidebar lang={lang} patient={patientData} doctor={doctor} onSettingsClick={() => setShowSettings(true)} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 7 }}>
                <WelcomeCard lang={lang} setLang={setLang} />

                <Card withBorder radius="md" shadow="sm" p="lg" mt="md">
                  <Tabs defaultValue="reminders" keepMounted={false}>
                    <Tabs.List>
                      <Tabs.Tab value="reminders" leftSection={<IconChecklist size={16} />}>
                        {t.reminders}
                      </Tabs.Tab>
                      <Tabs.Tab value="community" leftSection={<IconWorld size={16} />}>
                        {t.communityEvents}
                      </Tabs.Tab>
                      <Tabs.Tab value="analytics" leftSection={<IconChartLine size={16} />}>
                        {t.analytics}
                      </Tabs.Tab>
                      <Tabs.Tab value="mobile-settings" leftSection={<IconDeviceMobile size={16} />}>
                        Patient Mobile App
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="reminders" pt="md">
                      <RemindersTab lang={lang} tasks={tasks} setTasks={setTasks} />
                    </Tabs.Panel>
                    <Tabs.Panel value="community" pt="md">
                      <CommunityTab />
                    </Tabs.Panel>
                    <Tabs.Panel value="analytics" pt="md">
                      <AnalyticsTab lang={lang} />
                    </Tabs.Panel>
                    <Tabs.Panel value="mobile-settings" pt="md">
                      <PatientDisplaySettings lang={lang} />
                    </Tabs.Panel>
                  </Tabs>
                </Card>

                <WeekCalendar lang={lang} events={events} onOpenMonth={() => setCalendarOpen(true)} />
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 3 }}>
                <ChatAssistant lang={lang} />
              </Grid.Col>
            </Grid>
          </Container>
        </AppShell.Main>

        <MonthCalendarModal
          opened={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          events={events}
          patientId={patient?.pid}
          doctorId={user?.uid}
          onCreateEvent={async (appointmentData) => {
            try {
              await appointmentsAPI.create(appointmentData);
              // Refresh appointments after creating
              await fetchAppointments();
            } catch (error) {
              console.error('Error creating appointment:', error);
              alert('Failed to create appointment. Please try again.');
            }
          }}
        />
      </AppShell>

      <PatientRegistrationModal opened={showPatientModal} onClose={() => setShowPatientModal(false)} />
    </>
  );
}
