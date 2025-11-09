import { Stack, Accordion, Card, Text, Group, Divider, Button, Box } from "@mantine/core";
import { IconUser, IconStethoscope, IconPhone, IconMapPin, IconSettings } from "@tabler/icons-react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

export default function Sidebar({
  lang,
  patient,
  doctor,
  onSettingsClick,
}: {
  lang: Lang;
  patient: any;
  doctor: any;
  onSettingsClick?: () => void;
}) {
  const t = tDict[lang];

  return (
    <Box
      component="aside"
      style={{
        position: "fixed",
        left: 0,
        top: 88,
        width: 280,
        height: "calc(100vh - 104px)",
        padding: 12,
        overflowY: "auto",
      }}
    >
      <Stack gap="md" style={{ position: "sticky", top: 88, height: "calc(100vh - 104px)" }}>
        <Accordion multiple defaultValue={["profile", "doctor"]} radius="md">
          <Accordion.Item value="profile">
            <Accordion.Control icon={<IconUser size={18} />}>{t.patientInfo}</Accordion.Control>
            <Accordion.Panel>
              <Card withBorder radius="md" padding="md">
                <Stack gap={6}>
                  <Text size="sm">
                    <Text span c="dimmed">{t.name}:</Text>{" "}
                    <Text span fw={600}>{patient.name}</Text>
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed">{t.age}:</Text> {patient.age}
                  </Text>
                  <Text size="sm" c="red">
                    <Text span c="dimmed" style={{ color: "inherit" }}>{t.allergies}:</Text> {patient.allergies}
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed">{t.medication}:</Text> {patient.meds}
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed">{t.notes}:</Text> {patient.notes}
                  </Text>
                </Stack>
              </Card>
            </Accordion.Panel>
          </Accordion.Item>

          <Accordion.Item value="doctor">
            <Accordion.Control icon={<IconStethoscope size={18} />}>{t.doctorInfo}</Accordion.Control>
            <Accordion.Panel>
              <Card withBorder radius="md" padding="md">
                <Stack gap={6}>
                  <Text size="sm">
                    <Text span c="dimmed">{t.primaryCare}:</Text>{" "}
                    <Text span fw={600}>{doctor.name}</Text>
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed">{t.specialty}:</Text> {doctor.specialty}
                  </Text>
                  <Group gap="xs">
                    <IconPhone size={14} />
                    <Text size="sm">{doctor.phone}</Text>
                  </Group>
                  <Group gap="xs">
                    <IconMapPin size={14} />
                    <Text size="sm">{doctor.location}</Text>
                  </Group>
                  <Divider my="xs" />
                  <Text size="sm">
                    <Text span c="dimmed">{t.next}:</Text>{" "}
                    <Text span c="teal" fw={600}>{doctor.next}</Text>
                  </Text>
                </Stack>
              </Card>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        <Button fullWidth leftSection={<IconSettings size={16} />} onClick={onSettingsClick} style={{ marginTop: "auto" }}>
          {t.settings}
        </Button>
      </Stack>
    </Box>
  );
}
