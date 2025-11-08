import { Stack, Accordion, Card, Text, Group, Divider, Button } from "@mantine/core";
import { IconUser, IconStethoscope, IconPhone, IconMapPin, IconSettings } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

export default function Sidebar({
  lang,
  patient,
  doctor,
}: {
  lang: Lang;
  patient: any;
  doctor: any;
}) {
  const t = tDict[lang];
  return (
    <Stack gap="md" style={{ position: "sticky", top: 88, height: "calc(100vh - 104px)" }}>
      <Accordion multiple defaultValue={["profile", "doctor"]} radius="md">
        <Accordion.Item value="profile">
          <Accordion.Control icon={<IconUser size={18} />}>{t.patientInfo}</Accordion.Control>
          <Accordion.Panel>
            <Card withBorder radius="md" padding="md">
              <Stack gap={6}>
                <Text size="sm"><Text span c="dimmed">Name:</Text> <Text span fw={600}>{patient.name}</Text></Text>
                <Text size="sm"><Text span c="dimmed">Age:</Text> {patient.age}</Text>
                <Text size="sm" c="red"><Text span c="dimmed" style={{ color: "inherit" }}>Allergies:</Text> {patient.allergies}</Text>
                <Text size="sm"><Text span c="dimmed">Medication:</Text> {patient.meds}</Text>
                <Text size="sm"><Text span c="dimmed">Notes:</Text> {patient.notes}</Text>
              </Stack>
            </Card>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="doctor">
          <Accordion.Control icon={<IconStethoscope size={18} />}>{t.doctorInfo}</Accordion.Control>
          <Accordion.Panel>
            <Card withBorder radius="md" padding="md">
              <Stack gap={6}>
                <Text size="sm"><Text span c="dimmed">Primary Care:</Text> <Text span fw={600}>{doctor.name}</Text></Text>
                <Text size="sm"><Text span c="dimmed">Specialty:</Text> {doctor.specialty}</Text>
                <Group gap="xs"><IconPhone size={14} /><Text size="sm">{doctor.phone}</Text></Group>
                <Group gap="xs"><IconMapPin size={14} /><Text size="sm">{doctor.location}</Text></Group>
                <Divider my="xs" />
                <Text size="sm"><Text span c="dimmed">Next:</Text> <Text span c="teal" fw={600}>{doctor.next}</Text></Text>
              </Stack>
            </Card>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Button fullWidth leftSection={<IconSettings size={16} />} style={{ marginTop: "auto" }}>
        {t.settings}
      </Button>
    </Stack>
  );
}
