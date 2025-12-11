import { Paper, Text, Title, Group, Badge, Button, Stack, SimpleGrid, ThemeIcon } from '@mantine/core'
import { MapPin, Clock, GraduationCap, School as SchoolIcon } from 'lucide-react'
import { Program, School } from '@/types'

export interface ProgramWithSchool extends Program {
    schools: School
}

interface CourseListProps {
    programs: ProgramWithSchool[]
    loading: boolean
}

export function CourseList({ programs, loading }: CourseListProps) {
    if (loading) {
        return <Text>Chargement des formations...</Text>
    }

    if (programs.length === 0) {
        return (
            <Paper p="xl" withBorder radius="md" ta="center">
                <Text c="dimmed">Aucune formation ne correspond à vos critères.</Text>
            </Paper>
        )
    }

    return (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {programs.map((program) => (
                <Paper key={program.id} withBorder p="md" radius="md" style={{ display: 'flex', flexDirection: 'column' }}>
                    <Group justify="space-between" mb="xs">
                        <Badge variant="light" color="blue">{program.level || 'N/A'}</Badge>
                        {program.duration_years && (
                            <Badge variant="outline" color="gray">{program.duration_years} ans</Badge>
                        )}
                    </Group>

                    <Title order={3} size="h4" mb="xs" style={{ flex: 1 }}>
                        {program.name}
                    </Title>

                    <Group gap="xs" mb="md" c="dimmed">
                        <ThemeIcon variant="light" size="sm" color="gray">
                            <SchoolIcon size={12} />
                        </ThemeIcon>
                        <Text size="sm">{program.schools?.name}</Text>
                    </Group>

                    <Stack gap="xs" mb="md">
                        <Group gap="xs">
                            <MapPin size={16} className="text-gray-500" />
                            <Text size="sm" c="dimmed">{program.schools?.location || 'Localisation non spécifiée'}</Text>
                        </Group>

                        {(program.min_average_score ?? 0) > 0 && (
                            <Group gap="xs">
                                <GraduationCap size={16} className="text-gray-500" />
                                <Text size="sm" c="dimmed">
                                    Moyenne min: <Text span fw={500}>{program.min_average_score}/20</Text>
                                </Text>
                            </Group>
                        )}
                    </Stack>

                    <Button
                        variant="light"
                        fullWidth
                        mt="auto"
                        component="a"
                        href={`/courses/${program.id}`}
                        onClick={(e) => {
                        }}
                    >
                        Voir les détails
                    </Button>
                </Paper>
            ))}
        </SimpleGrid>
    )
}
