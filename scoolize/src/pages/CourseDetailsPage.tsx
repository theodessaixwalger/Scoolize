import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Container,
    Title,
    Text,
    Paper,
    Group,
    Stack,
    Button,
    Badge,
    Grid,
    ThemeIcon,
    List
} from '@mantine/core'
import {
    MapPin,
    Clock,
    GraduationCap,
    School as SchoolIcon,
    ArrowLeft,
    Globe,
    CheckCircle,
    Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'
import { ProgramWithSchool } from '@/components/Courses/CourseList'

export function CourseDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [program, setProgram] = useState<ProgramWithSchool | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchProgramDetails(id)
        }
    }, [id])

    const fetchProgramDetails = async (programId: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*, schools(*)')
                .eq('id', programId)
                .single()

            if (error) throw error

            setProgram(data as unknown as ProgramWithSchool)
        } catch (error: any) {
            console.error('Error fetching program details:', error)
            notifications.show({
                title: 'Erreur',
                message: 'Impossible de charger les détails de la formation',
                color: 'red',
            })
            navigate('/courses')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Container size="xl" py="xl">
                <Text>Chargement...</Text>
            </Container>
        )
    }

    if (!program) {
        return null
    }

    return (
        <Container size="xl" py="xl">
            <Button
                variant="subtle"
                leftSection={<ArrowLeft size={16} />}
                mb="md"
                onClick={() => navigate('/courses')}
            >
                Retour aux formations
            </Button>

            <Grid>
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        <Paper p="xl" withBorder radius="md">
                            <Group justify="space-between" mb="md">
                                <Badge size="lg" variant="light" color="blue">{program.level}</Badge>
                                {program.duration_years && (
                                    <Badge size="lg" variant="outline" color="gray">{program.duration_years} ans</Badge>
                                )}
                            </Group>

                            <Title order={1} mb="xs">{program.name}</Title>

                            <Group gap="md" mb="xl" c="dimmed">
                                <Group gap="xs">
                                    <SchoolIcon size={18} />
                                    <Text>{program.schools?.name}</Text>
                                </Group>
                                <Group gap="xs">
                                    <MapPin size={18} />
                                    <Text>{program.schools?.location}</Text>
                                </Group>
                            </Group>

                            <Title order={3} mb="md">À propos de la formation</Title>
                            <Text mb="xl" style={{ whiteSpace: 'pre-line' }}>
                                {program.description || "Aucune description disponible pour cette formation."}
                            </Text>

                            <Title order={3} mb="md">Pré-requis académiques</Title>
                            <List spacing="sm" icon={<CheckCircle size={16} color="green" />}>
                                <List.Item>
                                    Moyenne générale minimale : <Text span fw={700}>{program.min_average_score || 10}/20</Text>
                                </List.Item>
                                {program.min_math_score && (
                                    <List.Item>Mathématiques : <Text span fw={700}>{program.min_math_score}/20</Text></List.Item>
                                )}
                                {program.min_french_score && (
                                    <List.Item>Français : <Text span fw={700}>{program.min_french_score}/20</Text></List.Item>
                                )}
                                {program.min_english_score && (
                                    <List.Item>Anglais : <Text span fw={700}>{program.min_english_score}/20</Text></List.Item>
                                )}
                                {program.min_science_score && (
                                    <List.Item>Sciences : <Text span fw={700}>{program.min_science_score}/20</Text></List.Item>
                                )}
                            </List>
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        <Paper p="xl" withBorder radius="md">
                            <Title order={3} mb="lg">L'école</Title>

                            <Stack gap="md">
                                <Group>
                                    <ThemeIcon size="xl" variant="light" color="blue">
                                        <SchoolIcon size={24} />
                                    </ThemeIcon>
                                    <div>
                                        <Text fw={700} size="lg">{program.schools?.name}</Text>
                                        <Text size="sm" c="dimmed">{program.schools?.location}</Text>
                                    </div>
                                </Group>

                                <Text size="sm">
                                    {program.schools?.description || "Aucune description disponible pour cette école."}
                                </Text>

                                {program.schools?.website && (
                                    <Button
                                        component="a"
                                        href={program.schools.website}
                                        target="_blank"
                                        variant="outline"
                                        leftSection={<Globe size={16} />}
                                        fullWidth
                                    >
                                        Visiter le site web
                                    </Button>
                                )}
                            </Stack>
                        </Paper>

                        <Paper p="xl" withBorder radius="md">
                            <Title order={3} mb="lg">Candidature</Title>

                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <Users size={18} className="text-gray-500" />
                                        <Text>Places disponibles</Text>
                                    </Group>
                                    <Text fw={700}>{program.available_places || 'Non spécifié'}</Text>
                                </Group>

                                <Button size="lg" fullWidth>
                                    Candidater maintenant
                                </Button>
                                <Text size="xs" c="dimmed" ta="center">
                                    En cliquant sur candidater, votre dossier sera envoyé à l'école.
                                </Text>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    )
}
