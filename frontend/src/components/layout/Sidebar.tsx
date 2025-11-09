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
        <Accordion
          multiple
          defaultValue={["profile", "doctor"]}
          radius="lg"
          styles={{
            item: {
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(111, 184, 213, 0.2)',
              marginBottom: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            },
            control: {
              '&:hover': {
                background: 'rgba(111, 184, 213, 0.1)',
              }
            }
          }}
        >
          <Accordion.Item value="profile">
            <Accordion.Control icon={<IconUser size={18} />}>{t.patientInfo}</Accordion.Control>
            <Accordion.Panel>
              <Card
                withBorder
                radius="lg"
                padding="md"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 245, 240, 0.6) 0%, rgba(240, 249, 255, 0.6) 100%)',
                  borderColor: 'rgba(111, 184, 213, 0.3)'
                }}
              >
                <Stack gap={8}>
                  <Text size="sm">
                    <Text span c="dimmed" fw={500}>{t.name}:</Text>{" "}
                    <Text span fw={700} style={{ color: '#4a9ac0' }}>{patient.name}</Text>
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed" fw={500}>{t.age}:</Text> <Text span fw={600}>{patient.age}</Text>
                  </Text>
                  <Text size="sm" style={{ color: '#e67d52' }}>
                    <Text span c="dimmed" style={{ color: 'inherit' }} fw={500}>{t.allergies}:</Text>{" "}
                    <Text span fw={600}>{patient.allergies}</Text>
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed" fw={500}>{t.medication}:</Text> <Text span fw={600}>{patient.meds}</Text>
                  </Text>
                  <Text size="sm">
                    <Text span c="dimmed" fw={500}>{t.notes}:</Text> <Text span fw={600}>{patient.notes}</Text>
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

        <Button
          fullWidth
          leftSection={<IconSettings size={16} />}
          onClick={onSettingsClick}
          style={{ marginTop: "auto" }}
          variant="gradient"
          gradient={{ from: 'mintGreen.5', to: 'warmBlue.5', deg: 135 }}
          radius="md"
        >
          {t.settings}
        </Button>
      </Stack>
    </Box>
  );
}
