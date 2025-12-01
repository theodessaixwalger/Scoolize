import { useEffect, useState } from 'react'
import {
    Paper,
    Title,
    Text,
    Badge,
    Group,
    Stack,
    Button,
    Modal,
    Loader,
    Center
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'

interface StudentApplicationsListProps {
    userId: string
}

interface ApplicationWithDetails {
    id: string
    student_id: string
    status: 'pending' | 'accepted' | 'rejected'
    match_score: number
    created_at: string
    program: {
        name: string
        level: string
        school: {
            name: string
            location: string
        }
    }
}

export function StudentApplicationsList({ userId }: StudentApplicationsListProps) {
    const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [applicationToDelete, setApplicationToDelete] = useState<ApplicationWithDetails | null>(null)

    useEffect(() => {
        loadApplications()
    }, [userId])

    const loadApplications = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
          id,
          student_id,
          status,
          match_score,
          created_at,
          program:programs (
            name,
            level,
            school:schools (
              name,
              location
            )
          )
        `)
                .eq('student_id', userId)
                .order('created_at', { ascending: false })

            if (error) throw error

            setApplications(data as any)
        } catch (error: any) {
            notifications.show({
                title: 'Erreur',
                message: error.message,
                color: 'red',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleWithdrawClick = (application: ApplicationWithDetails) => {
        setApplicationToDelete(application)
        setDeleteModalOpen(true)
    }

    const confirmWithdraw = async () => {
        if (!applicationToDelete) return

        try {
            console.log('🗑️ Tentative de suppression:', {
                applicationId: applicationToDelete.id,
                studentId: applicationToDelete.student_id,
                currentUserId: userId
            })

            const { error, data } = await supabase
                .from('applications')
                .delete()
                .eq('id', applicationToDelete.id)
                .select()

            if (error) {
                console.error('❌ Erreur Supabase:', error)
                throw error
            }

            console.log('✅ Résultat suppression:', data)

            if (!data || data.length === 0) {
                throw new Error("La suppression a échoué silencieusement (RLS). Vérifiez les politiques de sécurité.")
            }

            notifications.show({
                title: 'Candidature retirée',
                message: 'Vous vous êtes désisté avec succès',
                color: 'green',
            })

            loadApplications()
        } catch (error: any) {
            console.error('❌ Exception:', error)
            notifications.show({
                title: 'Erreur de suppression',
                message: error.message || 'Une erreur inconnue est survenue',
                color: 'red',
                autoClose: false,
            })
        } finally {
            setDeleteModalOpen(false)
            setApplicationToDelete(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge color="green">Acceptée</Badge>
            case 'rejected':
                return <Badge color="red">Refusée</Badge>
            default:
                return <Badge color="orange">En attente</Badge>
        }
    }

    if (loading) {
        return (
            <Center h={200}>
                <Loader />
            </Center>
        )
    }

    if (applications.length === 0) {
        return (
            <Paper withBorder shadow="md" p={30} radius="md">
                <Title order={3} mb="md">
                    Mes candidatures
                </Title>
                <Text c="dimmed">
                    Vous n'avez pas encore candidaté à une formation.
                </Text>
            </Paper>
        )
    }

    return (
        <>
            <Paper withBorder shadow="md" p={30} radius="md">
                <Title order={3} mb="md">
                    Mes candidatures ({applications.length})
                </Title>

                <Stack gap="md">
                    {applications.map((app) => (
                        <Paper key={app.id} withBorder p="md" radius="md">
                            <Group justify="space-between" mb="sm">
                                <div>
                                    <Text fw={700} size="lg">
                                        {app.program.name}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {app.program.school.name} • {app.program.school.location}
                                    </Text>
                                    <Group mt={5}>
                                        <Badge variant="outline">{app.program.level}</Badge>
                                        {getStatusBadge(app.status)}
                                    </Group>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text size="xl" fw={700} c="blue">
                                        {app.match_score}%
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Compatibilité
                                    </Text>
                                </div>
                            </Group>

                            <Group justify="flex-end" mt="md">
                                <Button
                                    variant="subtle"
                                    color="red"
                                    size="xs"
                                    onClick={() => handleWithdrawClick(app)}
                                >
                                    Se désister
                                </Button>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            </Paper>

            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmer le désistement"
                size="sm"
            >
                <Text size="sm" mb="lg">
                    Êtes-vous sûr de vouloir retirer votre candidature pour <strong>{applicationToDelete?.program.name}</strong> ?
                    Cette action est irréversible.
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button color="red" onClick={confirmWithdraw}>
                        Se désister
                    </Button>
                </Group>
            </Modal>
        </>
    )
}
