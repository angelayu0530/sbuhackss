import { Card, Group, ThemeIcon, Title, Divider, Stack, Text, Box } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Lang } from "../../lib/types";
import { tDict } from "../../lib/i18n";

interface DataPoint {
    day: string;
    tasks: number;
    feeling: number;
    alerts: number;
}

export default function AnalyticsTab({ lang }: { lang: Lang }) {
    const t = tDict[lang];
    const [weekData, setWeekData] = useState<DataPoint[]>([]);

    useEffect(() => {
        // Mock data for the week - in production, fetch from backend
        const mockData: DataPoint[] = [
            { day: "Mon", tasks: 2, feeling: 7, alerts: 1 },
            { day: "Tue", tasks: 3, feeling: 8, alerts: 0 },
            { day: "Wed", tasks: 3, feeling: 9, alerts: 0 },
            { day: "Thu", tasks: 3, feeling: 5, alerts: 2 },
            { day: "Fri", tasks: 4, feeling: 3, alerts: 3 },
            { day: "Sat", tasks: 3, feeling: 6, alerts: 0 },
            { day: "Sun", tasks: 3, feeling: 8, alerts: 0 },
        ];
        setWeekData(mockData);
    }, []);

    // Calculate max values for scaling
    const maxTasks = Math.max(...weekData.map(d => d.tasks), 10);
    const maxFeeling = 10; // Feeling is on a scale of 1-10
    const maxAlerts = Math.max(...weekData.map(d => d.alerts), 5);

    // Chart dimensions
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const plotHeight = chartHeight - padding.top - padding.bottom;
    const plotWidth = chartWidth - padding.left - padding.right;

    // Function to convert data to SVG coordinates
    const getX = (index: number) => padding.left + (index * plotWidth) / (weekData.length - 1);
    const getTasksY = (value: number) => padding.top + plotHeight - (value / maxTasks) * plotHeight;
    const getFeelingY = (value: number) => padding.top + plotHeight - (value / maxFeeling) * plotHeight;
    const getAlertsY = (value: number) => padding.top + plotHeight - (value / maxAlerts) * plotHeight;

    // Create path strings for each line
    const tasksPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getTasksY(d.tasks)}`).join(' ');
    const feelingPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getFeelingY(d.feeling)}`).join(' ');
    const alertsPath = weekData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getAlertsY(d.alerts)}`).join(' ');

    return (
        <Stack gap="md">
            <Card withBorder radius="md" padding="lg">
                <Group mb="md">
                    <ThemeIcon variant="light" color="blue" radius="md">
                        <IconChartLine size={20} />
                    </ThemeIcon>
                    <Title order={4}>{t.weeklyAnalytics}</Title>
                </Group>
                <Divider mb="md" />

                {/* Legend */}
                <Group gap="xl" mb="lg" justify="center">
                    <Group gap="xs">
                        <Box w={30} h={3} style={{ backgroundColor: '#fd7e14', borderRadius: 2 }} />
                        <Text size="sm" fw={500}>{t.tasksCompleted}</Text>
                    </Group>
                    <Group gap="xs">
                        <Box w={30} h={3} style={{ backgroundColor: '#339af0', borderRadius: 2 }} />
                        <Text size="sm" fw={500}>{t.patientFeeling}</Text>
                    </Group>
                    <Group gap="xs">
                        <Box w={30} h={3} style={{ backgroundColor: '#fa5252', borderRadius: 2 }} />
                        <Text size="sm" fw={500}>{t.alertsTriggered}</Text>
                    </Group>
                </Group>

                {/* Chart */}
                <Box style={{ width: '100%', overflowX: 'auto' }}>
                    <svg width={chartWidth} height={chartHeight} style={{ display: 'block', margin: '0 auto' }}>
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => {
                            const y = padding.top + (plotHeight / 4) * i;
                            return (
                                <g key={i}>
                                    <line
                                        x1={padding.left}
                                        y1={y}
                                        x2={chartWidth - padding.right}
                                        y2={y}
                                        stroke="#e9ecef"
                                        strokeWidth={1}
                                    />
                                </g>
                            );
                        })}

                        {/* Tasks line (orange) */}
                        <path
                            d={tasksPath}
                            fill="none"
                            stroke="#fd7e14"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Tasks points */}
                        {weekData.map((d, i) => (
                            <circle
                                key={`task-${i}`}
                                cx={getX(i)}
                                cy={getTasksY(d.tasks)}
                                r={5}
                                fill="#fd7e14"
                            />
                        ))}

                        {/* Feeling line (blue) */}
                        <path
                            d={feelingPath}
                            fill="none"
                            stroke="#339af0"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Feeling points */}
                        {weekData.map((d, i) => (
                            <circle
                                key={`feeling-${i}`}
                                cx={getX(i)}
                                cy={getFeelingY(d.feeling)}
                                r={5}
                                fill="#339af0"
                            />
                        ))}

                        {/* Alerts line (red) */}
                        <path
                            d={alertsPath}
                            fill="none"
                            stroke="#fa5252"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Alerts points */}
                        {weekData.map((d, i) => (
                            <circle
                                key={`alert-${i}`}
                                cx={getX(i)}
                                cy={getAlertsY(d.alerts)}
                                r={5}
                                fill="#fa5252"
                            />
                        ))}

                        {/* X-axis labels */}
                        {weekData.map((d, i) => (
                            <text
                                key={`label-${i}`}
                                x={getX(i)}
                                y={chartHeight - padding.bottom + 20}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#868e96"
                            >
                                {d.day}
                            </text>
                        ))}

                        {/* Y-axis */}
                        <line
                            x1={padding.left}
                            y1={padding.top}
                            x2={padding.left}
                            y2={chartHeight - padding.bottom}
                            stroke="#868e96"
                            strokeWidth={2}
                        />
                        {/* X-axis */}
                        <line
                            x1={padding.left}
                            y1={chartHeight - padding.bottom}
                            x2={chartWidth - padding.right}
                            y2={chartHeight - padding.bottom}
                            stroke="#868e96"
                            strokeWidth={2}
                        />
                    </svg>
                </Box>

                {/* Summary Stats */}
                <Group grow mt="xl">
                    <Card withBorder padding="md" radius="md" style={{ borderColor: '#fd7e14' }}>
                        <Text size="xs" c="dimmed" mb={4}>{t.totalTasks}</Text>
                        <Text size="xl" fw={700} c="orange">
                            {weekData.reduce((sum, d) => sum + d.tasks, 0)}
                        </Text>
                    </Card>
                    <Card withBorder padding="md" radius="md" style={{ borderColor: '#339af0' }}>
                        <Text size="xs" c="dimmed" mb={4}>{t.avgFeeling}</Text>
                        <Text size="xl" fw={700} c="blue">
                            {(weekData.reduce((sum, d) => sum + d.feeling, 0) / weekData.length).toFixed(1)}
                        </Text>
                    </Card>
                    <Card withBorder padding="md" radius="md" style={{ borderColor: '#fa5252' }}>
                        <Text size="xs" c="dimmed" mb={4}>{t.totalAlerts}</Text>
                        <Text size="xl" fw={700} c="red">
                            {weekData.reduce((sum, d) => sum + d.alerts, 0)}
                        </Text>
                    </Card>
                </Group>
            </Card>
        </Stack>
    );
}
