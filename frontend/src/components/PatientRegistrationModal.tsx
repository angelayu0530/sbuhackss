import { useState } from "react";
import { Modal, Button, TextInput, NumberInput, Select, Textarea, Group, Stack, Alert, Card, Text, Divider } from "@mantine/core";
import { IconAlertCircle, IconUser } from "@tabler/icons-react";
import { patientAPI } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import type { Patient } from "../lib/types";

interface PatientRegistrationModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function PatientRegistrationModal({ opened, onClose }: PatientRegistrationModalProps) {
  const { user, token, setPatient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    age: undefined as number | undefined,
    gender: "",
    medical_summary: "",
    emergency_contact: "",
  });

  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!user || !token) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    if (!formData.name.trim()) {
      setError("Patient name is required");
      setIsLoading(false);
      return;
    }

    try {
      const data = await patientAPI.create(
        {
          caretaker_id: user.uid,
          name: formData.name,
          age: formData.age,
          gender: formData.gender || undefined,
          medical_summary: formData.medical_summary || undefined,
          emergency_contact: formData.emergency_contact || undefined,
        },
        token
      );

      if (data.error) {
        setError(data.error);
      } else {
        // Store patient info
        const patientData: Patient = {
          pid: data.pid,
          caretaker_id: user.uid,
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          medical_summary: formData.medical_summary,
          emergency_contact: formData.emergency_contact,
        };
        setPatient(patientData);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Patient Information"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <Stack gap="md">
          {/* Basic Information Card */}
          <Card withBorder radius="md" padding="md" style={{ backgroundColor: "#f8f9fa" }}>
            <Group mb="sm">
              <IconUser size={20} color="teal" />
              <Text fw={600} size="sm">Basic Information</Text>
            </Group>
            <Divider my="sm" />
            <Stack gap="md">
              <TextInput
                label="Patient Name *"
                placeholder="Patient's full name"
                required
                value={formData.name}
                onChange={(e) => handleChange("name", e.currentTarget.value)}
              />

              <NumberInput
                label="Age"
                placeholder="Patient's age"
                value={formData.age}
                onChange={(val) => handleChange("age", val)}
                min={0}
                max={150}
              />

              <Select
                label="Gender"
                placeholder="Select gender"
                data={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                  { value: "prefer_not_to_say", label: "Prefer not to say" },
                ]}
                value={formData.gender}
                onChange={(val) => handleChange("gender", val || "")}
                clearable
              />

              <TextInput
                label="Emergency Contact"
                placeholder="Phone number or name"
                value={formData.emergency_contact}
                onChange={(e) => handleChange("emergency_contact", e.currentTarget.value)}
              />
            </Stack>
          </Card>

          {/* Medical Information Card */}
          <Card withBorder radius="md" padding="md" style={{ backgroundColor: "#f8f9fa" }}>
            <Group mb="sm">
              <IconUser size={20} color="red" />
              <Text fw={600} size="sm">Medical Information</Text>
            </Group>
            <Divider my="sm" />
            <Stack gap="md">
              <Textarea
                label="Medical History & Summary"
                placeholder="Existing conditions, past surgeries, medical history, etc."
                value={formData.medical_summary}
                onChange={(e) => handleChange("medical_summary", e.currentTarget.value)}
                minRows={3}
              />
            </Stack>
          </Card>

          {/* Action Buttons */}
          <Group justify="flex-end" pt="md">
            <Button variant="light" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} color="teal">
              Create Patient Profile
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
