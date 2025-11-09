import { useState } from "react";
import {
  Container,
  Tabs,
  Text,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Alert,
  Select,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { useAuth } from "../contexts/useAuth";
import { authAPI, patientAPI } from "../services/api";

export default function Settings({ onBack }: { onBack?: () => void }) {
  const { user, token, patient, updateUser, updatePatient } = useAuth();

  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [userPhone, setUserPhone] = useState(user?.phone || "");
  const [userLoading, setUserLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [patientName, setPatientName] = useState(patient?.name || "");
  const [patientAge, setPatientAge] = useState(patient?.age?.toString() || "");
  const [patientGender, setPatientGender] = useState(patient?.gender || "");
  const [medicalSummary, setMedicalSummary] = useState(
    patient?.medical_summary || ""
  );
  const [emergencyContact, setEmergencyContact] = useState(
    patient?.emergency_contact || ""
  );
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientMessage, setPatientMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUserUpdate = async () => {
    if (!user || !token) return;

    setUserLoading(true);
    setUserMessage(null);

    try {
      const result = await authAPI.updateUser(user.uid, {
        name: userName,
        email: userEmail,
        phone: userPhone,
      }, token);

      if (result.error) {
        setUserMessage({ type: "error", text: result.error });
      } else {
        updateUser({
          uid: user.uid,
          email: userEmail,
          name: userName,
          phone: userPhone,
        });
        setUserMessage({ type: "success", text: "User info updated successfully!" });
      }
    } catch (error) {
      setUserMessage({
        type: "error",
        text: `Error updating user info: ${error}`,
      });
    } finally {
      setUserLoading(false);
    }
  };

  // Update patient info
  const handlePatientUpdate = async () => {
    if (!patient?.pid || !token) return;

    setPatientLoading(true);
    setPatientMessage(null);

    try {
      const result = await patientAPI.update(
        patient.pid,
        {
          name: patientName,
          age: patientAge ? parseInt(patientAge) : undefined,
          gender: patientGender,
          medical_summary: medicalSummary,
          emergency_contact: emergencyContact,
        },
        token
      );

      if (result.error) {
        setPatientMessage({ type: "error", text: result.error });
      } else {
        updatePatient({
          ...patient,
          name: patientName,
          age: patientAge ? parseInt(patientAge) : patient.age,
          gender: patientGender,
          medical_summary: medicalSummary,
          emergency_contact: emergencyContact,
        });
        setPatientMessage({
          type: "success",
          text: "Patient info updated successfully!",
        });
      }
    } catch (error) {
      setPatientMessage({
        type: "error",
        text: `Error updating patient info: ${error}`,
      });
    } finally {
      setPatientLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="lg">
        <Text size="lg" fw={600}>Settings</Text>
        {onBack && (
          <Button variant="light" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
            Go Back to Dashboard
          </Button>
        )}
      </Group>

      <Tabs defaultValue="user" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="user">My Account</Tabs.Tab>
          {patient && <Tabs.Tab value="patient">Patient Info</Tabs.Tab>}
        </Tabs.List>

        {/* User Settings Tab */}
        <Tabs.Panel value="user" pt="xl">
          <Card withBorder radius="md" shadow="sm" p="lg">
            <Text size="lg" fw={500} mb="md">
              Account Settings
            </Text>

            {userMessage && (
              <Alert
                icon={
                  userMessage.type === "success" ? (
                    <IconCheck size={16} />
                  ) : (
                    <IconAlertCircle size={16} />
                  )
                }
                title={userMessage.type === "success" ? "Success" : "Error"}
                color={userMessage.type === "success" ? "teal" : "red"}
                mb="md"
              >
                {userMessage.text}
              </Alert>
            )}

            <Stack gap="md">
              <TextInput
                label="Name"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.currentTarget.value)}
              />

              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.currentTarget.value)}
              />

              <TextInput
                label="Phone"
                placeholder="+1 (555) 123-4567"
                value={userPhone}
                onChange={(e) => setUserPhone(e.currentTarget.value)}
              />

              <Group justify="flex-end" pt="md">
                <Button
                  variant="light"
                  onClick={() => {
                    setUserName(user?.name || "");
                    setUserEmail(user?.email || "");
                    setUserPhone(user?.phone || "");
                    setUserMessage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUserUpdate} loading={userLoading}>
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Patient Settings Tab */}
        {patient && (
          <Tabs.Panel value="patient" pt="xl">
            <Card withBorder radius="md" shadow="sm" p="lg">
              <Text size="lg" fw={500} mb="md">
                Patient Information
              </Text>

              {patientMessage && (
                <Alert
                  icon={
                    patientMessage.type === "success" ? (
                      <IconCheck size={16} />
                    ) : (
                      <IconAlertCircle size={16} />
                    )
                  }
                  title={patientMessage.type === "success" ? "Success" : "Error"}
                  color={patientMessage.type === "success" ? "teal" : "red"}
                  mb="md"
                >
                  {patientMessage.text}
                </Alert>
              )}

              <Stack gap="md">
                <TextInput
                  label="Patient Name"
                  placeholder="Patient's name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.currentTarget.value)}
                />

                <Group grow>
                  <TextInput
                    label="Age"
                    placeholder="Age"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.currentTarget.value)}
                  />

                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    value={patientGender}
                    onChange={(val) => setPatientGender(val || "")}
                    data={[
                      { value: "Male", label: "Male" },
                      { value: "Female", label: "Female" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                </Group>

                <TextInput
                  label="Emergency Contact"
                  placeholder="Contact name and number"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.currentTarget.value)}
                />

                <Textarea
                  label="Medical Summary"
                  placeholder="Brief medical history or notes"
                  value={medicalSummary}
                  onChange={(e) => setMedicalSummary(e.currentTarget.value)}
                  rows={4}
                />

                <Group justify="flex-end" pt="md">
                  <Button
                    variant="light"
                    onClick={() => {
                      setPatientName(patient?.name || "");
                      setPatientAge(patient?.age?.toString() || "");
                      setPatientGender(patient?.gender || "");
                      setEmergencyContact(patient?.emergency_contact || "");
                      setMedicalSummary(patient?.medical_summary || "");
                      setPatientMessage(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePatientUpdate}
                    loading={patientLoading}
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Tabs.Panel>
        )}
      </Tabs>
    </Container>
  );
}
