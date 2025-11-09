import { useState, useEffect } from "react";
import {
    Card,
    Title,
    Text,
    Stack,
    Group,
    Switch,
    TextInput,
    Button,
    Textarea,
    NumberInput,
    Select,
    Divider,
    Badge,
    ActionIcon,
    Paper,
    Alert,
} from "@mantine/core";
import {
    IconDeviceMobile,
    IconMapPin,
    IconQuestionMark,
    IconPhone,
    IconSend,
    IconTrash,
    IconPlus,
    IconCheck,
} from "@tabler/icons-react";
import { useAuth } from "../../contexts/useAuth";
import { patientDisplayAPI } from "../../services/api";
import type {
    PatientDisplayConfig,
    NavigationLandmark,
    PatientFAQ,
    EmergencyContact,
} from "../../services/api";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

export default function PatientDisplaySettings({ lang }: { lang: Lang }) {
    const t = tDict[lang];
    const { patient, token } = useAuth();
    const [config, setConfig] = useState<PatientDisplayConfig | null>(null);
    const [landmarks, setLandmarks] = useState<NavigationLandmark[]>([]);
    const [faqs, setFAQs] = useState<PatientFAQ[]>([]);
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [urgentMessage, setUrgentMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // New landmark form
    const [newLandmark, setNewLandmark] = useState<NavigationLandmark>({
        step_number: 1,
        title: "",
        description: "",
        photo_url: "",
    });

    // New FAQ form
    const [newFAQ, setNewFAQ] = useState<PatientFAQ>({
        question: "",
        answer_text: "",
    });

    // New contact form
    const [newContact, setNewContact] = useState<EmergencyContact>({
        name: "",
        relationship: "",
        phone: "",
        is_primary: false,
    });

    useEffect(() => {
        if (patient && token) {
            loadData();
        }
    }, [patient, token]);

    const loadData = async () => {
        if (!patient?.pid || !token) return;
        try {
            const [configData, landmarksData, faqsData, contactsData] = await Promise.all([
                patientDisplayAPI.getConfig(patient.pid, token),
                patientDisplayAPI.getLandmarks(patient.pid, token),
                patientDisplayAPI.getFAQs(patient.pid, token),
                patientDisplayAPI.getContacts(patient.pid, token),
            ]);
            setConfig(configData);
            setLandmarks(landmarksData);
            setFAQs(faqsData);
            setContacts(contactsData);
        } catch (error) {
            console.error("Error loading patient display data:", error);
        }
    };

    const updateConfig = async (updates: Partial<PatientDisplayConfig>) => {
        if (!patient?.pid || !token || !config) return;
        try {
            await patientDisplayAPI.updateConfig(patient.pid, updates, token);
            setConfig({ ...config, ...updates });
            showSuccess();
        } catch (error) {
            console.error("Error updating config:", error);
        }
    };

    const addLandmark = async () => {
        if (!patient?.pid || !token || !newLandmark.title) return;
        try {
            await patientDisplayAPI.createLandmark(patient.pid, newLandmark, token);
            await loadData();
            setNewLandmark({ step_number: landmarks.length + 2, title: "", description: "", photo_url: "" });
            showSuccess();
        } catch (error) {
            console.error("Error adding landmark:", error);
        }
    };

    const deleteLandmark = async (id: number) => {
        if (!token) return;
        try {
            await patientDisplayAPI.deleteLandmark(id, token);
            await loadData();
            showSuccess();
        } catch (error) {
            console.error("Error deleting landmark:", error);
        }
    };

    const addFAQ = async () => {
        if (!patient?.pid || !token || !newFAQ.question || !newFAQ.answer_text) return;
        try {
            await patientDisplayAPI.createFAQ(patient.pid, newFAQ, token);
            await loadData();
            setNewFAQ({ question: "", answer_text: "" });
            showSuccess();
        } catch (error) {
            console.error("Error adding FAQ:", error);
        }
    };

    const deleteFAQ = async (id: number) => {
        if (!token) return;
        try {
            await patientDisplayAPI.deleteFAQ(id, token);
            await loadData();
            showSuccess();
        } catch (error) {
            console.error("Error deleting FAQ:", error);
        }
    };

    const addContact = async () => {
        if (!patient?.pid || !token || !newContact.name || !newContact.phone) return;
        try {
            await patientDisplayAPI.createContact(patient.pid, newContact, token);
            await loadData();
            setNewContact({ name: "", relationship: "", phone: "", is_primary: false });
            showSuccess();
        } catch (error) {
            console.error("Error adding contact:", error);
        }
    };

    const deleteContact = async (id: number) => {
        if (!token) return;
        try {
            await patientDisplayAPI.deleteContact(id, token);
            await loadData();
            showSuccess();
        } catch (error) {
            console.error("Error deleting contact:", error);
        }
    };

    const sendUrgent = async () => {
        if (!patient?.pid || !token || !urgentMessage) return;
        setLoading(true);
        try {
            await patientDisplayAPI.sendUrgentMessage(patient.pid, urgentMessage, token);
            setUrgentMessage("");
            showSuccess();
        } catch (error) {
            console.error("Error sending urgent message:", error);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = () => {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    };

    if (!patient) {
        return (
            <Card withBorder p="lg">
                <Text>No patient selected</Text>
            </Card>
        );
    }

    return (
        <Stack gap="lg">
            {success && (
                <Alert color="green" icon={<IconCheck size={16} />} title="Success!">
                    Changes saved and synced to mobile app
                </Alert>
            )}

            {/* Alert Status - No alerts triggered */}
            <Alert
                color="teal"
                title={`🎉 ${t.allClear}`}
                variant="light"
                styles={{
                    root: {
                        padding: '20px',
                    },
                }}
            >
                <Stack gap="xs">
                    <Text size="lg" fw={600}>
                        {patient.name} {t.noAlertsToday}
                    </Text>
                    <Text size="md" c="dimmed">
                        {t.patientDoingWell}
                    </Text>
                    <Text size="sm" c="dimmed" mt="xs">
                        {t.lastChecked} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </Stack>
            </Alert>
            {/* 
            {!config && (
                <Card withBorder p="lg">
                    <Text>Loading settings...</Text>
                </Card>
            )} */}

            {config && (
                <>

                    {/* Header */}
                    <Card withBorder p="lg">
                        <Group justify="space-between">
                            <Group>
                                <IconDeviceMobile size={28} />
                                <div>
                                    <Title order={3}>Patient Mobile App Settings</Title>
                                    <Text size="sm" c="dimmed">
                                        Configure what {patient.name} sees on their mobile device
                                    </Text>
                                </div>
                            </Group>
                            <Badge color="green" size="lg">
                                Real-time Sync Active
                            </Badge>
                        </Group>
                    </Card>

                    {/* General Settings */}
                    <Card withBorder p="lg">
                        <Title order={4} mb="md">
                            Display Settings
                        </Title>
                        <Stack gap="md">
                            <Switch
                                label="Show Daily Schedule"
                                description="Display today's appointments and tasks"
                                checked={config.show_schedule}
                                onChange={(e) => updateConfig({ show_schedule: e.currentTarget.checked })}
                            />
                            <Switch
                                label="Show Navigation Home"
                                description="Show 'How to Get Home' feature with landmarks"
                                checked={config.show_navigation}
                                onChange={(e) => updateConfig({ show_navigation: e.currentTarget.checked })}
                            />
                            <Switch
                                label="Show FAQ Section"
                                description="Display answers to common questions"
                                checked={config.show_faq}
                                onChange={(e) => updateConfig({ show_faq: e.currentTarget.checked })}
                            />
                            <Switch
                                label="Voice Reminders"
                                description="Read reminders aloud before events"
                                checked={config.voice_reminders_enabled}
                                onChange={(e) => updateConfig({ voice_reminders_enabled: e.currentTarget.checked })}
                            />
                            <Switch
                                label="GPS Tracking"
                                description="Track patient location (requires permission)"
                                checked={config.gps_tracking_enabled}
                                onChange={(e) => updateConfig({ gps_tracking_enabled: e.currentTarget.checked })}
                            />
                        </Stack>
                    </Card>

                    {/* Home Navigation */}
                    <Card withBorder p="lg">
                        <Group justify="space-between" mb="md">
                            <Group>
                                <IconMapPin size={20} />
                                <Title order={4}>Home Navigation</Title>
                            </Group>
                        </Group>

                        <TextInput
                            label="Home Address"
                            placeholder="123 Oak Street"
                            value={config.home_address || ""}
                            onChange={(e) => updateConfig({ home_address: e.currentTarget.value })}
                            mb="md"
                        />

                        <Divider label="Navigation Landmarks" my="md" />

                        <Stack gap="sm" mb="md">
                            {landmarks.map((landmark) => (
                                <Paper key={landmark.id} withBorder p="sm">
                                    <Group justify="space-between">
                                        <div>
                                            <Text fw={500}>
                                                Step {landmark.step_number}: {landmark.title}
                                            </Text>
                                            <Text size="sm" c="dimmed">
                                                {landmark.description}
                                            </Text>
                                        </div>
                                        <ActionIcon color="red" onClick={() => landmark.id && deleteLandmark(landmark.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>

                        <Paper withBorder p="md" bg="gray.0">
                            <Text fw={500} mb="sm">
                                Add New Landmark
                            </Text>
                            <Stack gap="xs">
                                <NumberInput
                                    label="Step Number"
                                    value={newLandmark.step_number}
                                    onChange={(val) => setNewLandmark({ ...newLandmark, step_number: val as number })}
                                    min={1}
                                />
                                <TextInput
                                    label="Title"
                                    placeholder="Exit through main doors"
                                    value={newLandmark.title}
                                    onChange={(e) => setNewLandmark({ ...newLandmark, title: e.currentTarget.value })}
                                />
                                <Textarea
                                    label="Description"
                                    placeholder="Turn right at the exit"
                                    value={newLandmark.description}
                                    onChange={(e) => setNewLandmark({ ...newLandmark, description: e.currentTarget.value })}
                                />
                                <TextInput
                                    label="Photo URL (optional)"
                                    placeholder="https://..."
                                    value={newLandmark.photo_url}
                                    onChange={(e) => setNewLandmark({ ...newLandmark, photo_url: e.currentTarget.value })}
                                />
                                <Button leftSection={<IconPlus size={16} />} onClick={addLandmark} fullWidth>
                                    Add Landmark
                                </Button>
                            </Stack>
                        </Paper>
                    </Card>

                    {/* FAQ Section */}
                    <Card withBorder p="lg">
                        <Group justify="space-between" mb="md">
                            <Group>
                                <IconQuestionMark size={20} />
                                <Title order={4}>Frequently Asked Questions</Title>
                            </Group>
                        </Group>

                        <Stack gap="sm" mb="md">
                            {faqs.map((faq) => (
                                <Paper key={faq.id} withBorder p="sm">
                                    <Group justify="space-between" align="flex-start">
                                        <div style={{ flex: 1 }}>
                                            <Text fw={500}>{faq.question}</Text>
                                            <Text size="sm" c="dimmed">
                                                {faq.answer_text}
                                            </Text>
                                        </div>
                                        <ActionIcon color="red" onClick={() => faq.id && deleteFAQ(faq.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>

                        <Paper withBorder p="md" bg="gray.0">
                            <Text fw={500} mb="sm">
                                Add New FAQ
                            </Text>
                            <Stack gap="xs">
                                <TextInput
                                    label="Question"
                                    placeholder="Where is Sarah?"
                                    value={newFAQ.question}
                                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.currentTarget.value })}
                                />
                                <Textarea
                                    label="Answer"
                                    placeholder="I'm at work. I'll be home at 5:00 PM."
                                    value={newFAQ.answer_text}
                                    onChange={(e) => setNewFAQ({ ...newFAQ, answer_text: e.currentTarget.value })}
                                    minRows={3}
                                />
                                <Button leftSection={<IconPlus size={16} />} onClick={addFAQ} fullWidth>
                                    Add FAQ
                                </Button>
                            </Stack>
                        </Paper>
                    </Card>

                    {/* Emergency Contacts */}
                    <Card withBorder p="lg">
                        <Group justify="space-between" mb="md">
                            <Group>
                                <IconPhone size={20} />
                                <Title order={4}>Emergency Contacts</Title>
                            </Group>
                        </Group>

                        <Stack gap="sm" mb="md">
                            {contacts.map((contact) => (
                                <Paper key={contact.id} withBorder p="sm">
                                    <Group justify="space-between">
                                        <div>
                                            <Group gap="xs">
                                                <Text fw={500}>{contact.name}</Text>
                                                {contact.is_primary && <Badge size="sm">Primary</Badge>}
                                            </Group>
                                            <Text size="sm" c="dimmed">
                                                {contact.relationship} • {contact.phone}
                                            </Text>
                                        </div>
                                        <ActionIcon color="red" onClick={() => contact.id && deleteContact(contact.id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>

                        <Paper withBorder p="md" bg="gray.0">
                            <Text fw={500} mb="sm">
                                Add New Contact
                            </Text>
                            <Stack gap="xs">
                                <TextInput
                                    label="Name"
                                    placeholder="Sarah Smith"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.currentTarget.value })}
                                />
                                <TextInput
                                    label="Relationship"
                                    placeholder="Daughter"
                                    value={newContact.relationship}
                                    onChange={(e) => setNewContact({ ...newContact, relationship: e.currentTarget.value })}
                                />
                                <TextInput
                                    label="Phone"
                                    placeholder="555-1234"
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.currentTarget.value })}
                                />
                                <Switch
                                    label="Primary Contact"
                                    checked={newContact.is_primary}
                                    onChange={(e) => setNewContact({ ...newContact, is_primary: e.currentTarget.checked })}
                                />
                                <Button leftSection={<IconPlus size={16} />} onClick={addContact} fullWidth>
                                    Add Contact
                                </Button>
                            </Stack>
                        </Paper>
                    </Card>

                    {/* Caregiver Status */}
                    <Card withBorder p="lg">
                        <Title order={4} mb="md">
                            Your Status (Visible to Patient)
                        </Title>
                        <Select
                            label="Current Status"
                            placeholder="Select your status"
                            value={config.caregiver_status || ""}
                            onChange={(val) => updateConfig({ caregiver_status: val || undefined })}
                            data={[
                                { value: "At home", label: "At home" },
                                { value: "At work", label: "At work" },
                                { value: "Running errands", label: "Running errands" },
                                { value: "At the store", label: "At the store" },
                                { value: "On my way home", label: "On my way home" },
                                { value: "Out for the evening", label: "Out for the evening" },
                            ]}
                        />
                    </Card>

                    {/* Urgent Message */}
                    <Card withBorder p="lg" bg="orange.0">
                        <Title order={4} mb="md">
                            <Group>
                                <IconSend size={20} />
                                Send Urgent Message
                            </Group>
                        </Title>
                        <Text size="sm" c="dimmed" mb="md">
                            This will appear immediately as a notification on the patient's phone
                        </Text>
                        <Group align="flex-end">
                            <Textarea
                                placeholder="Lunch is ready! Come to the kitchen."
                                value={urgentMessage}
                                onChange={(e) => setUrgentMessage(e.currentTarget.value)}
                                style={{ flex: 1 }}
                                minRows={2}
                            />
                            <Button
                                leftSection={<IconSend size={16} />}
                                onClick={sendUrgent}
                                loading={loading}
                                disabled={!urgentMessage}
                                color="orange"
                            >
                                Send Now
                            </Button>
                        </Group>
                    </Card>
                </>
            )}
        </Stack>
    );
}
