import { useEffect, useState } from 'react'
import {
    Table,
    Badge,
    Group,
    ActionIcon,
    Text,
    Paper,
    Title,
    Button,
    Modal
} from '@mantine/core'
import { Pencil, Trash, Plus } from 'lucide-react'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import { Program } from '@/types'
import { ProgramForm } from './ProgramForm'

interface SchoolProgramsListProps {
    schoolId: string
}

export function SchoolProgramsList({ schoolId }: SchoolProgramsListProps) {
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProgram, setEditingProgram] = useState<Program | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null)

    useEffect(() => {
        loadPrograms()
    }, [schoolId])

    const loadPrograms = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('programs')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })

        if (data && !error) {
            setPrograms(data)
        }
        setLoading(false)
    }

    const handleEdit = (program: Program) => {
        setEditingProgram(program)
        setIsModalOpen(true)
    }

    const handleDeleteClick = (program: Program) => {
        setProgramToDelete(program)
        setDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!programToDelete) return

        try {
            const { error } = await supabase
                .from('programs')
                .delete()
                .eq('id', programToDelete.id)

            if (error) throw error

            notifications.show({
                title: 'Formation supprimée',
                message: 'La formation a été supprimée avec succès',
                color: 'green',
            })

            loadPrograms()
        } catch (error: any) {
            notifications.show({
                title: 'Erreur',
                message: error.message,
                color: 'red',
            })
        } finally {
            setDeleteModalOpen(false)
            setProgramToDelete(null)
        }
    }

    const handleSuccess = () => {
        setIsModalOpen(false)
        setEditingProgram(null)
        loadPrograms()
    }

    return (
        <>
            <Paper withBorder shadow="md" p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <Title order={3}>Mes formations</Title>
                    <Button
                        leftSection={<Plus size={16} />}
                        onClick={() => {
                            setEditingProgram(null)
                            setIsModalOpen(true)
                        }}
                    >
                        Nouvelle formation
                    </Button>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Nom</Table.Th>
                            <Table.Th>Niveau</Table.Th>
                            <Table.Th>Places</Table.Th>
                            <Table.Th>Moyenne min.</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                    <Text c="dimmed">Chargement des formations...</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : programs.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                                    <Text c="dimmed">Aucune formation créée pour le moment</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            programs.map((program) => (
                                <Table.Tr key={program.id}>
                                    <Table.Td>{program.name}</Table.Td>
                                    <Table.Td>
                                        <Badge>{program.level}</Badge>
                                    </Table.Td>
                                    <Table.Td>{program.available_places}</Table.Td>
                                    <Table.Td>{program.min_average_score}/20</Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Group gap="xs" justify="flex-end">
                                            <ActionIcon
                                                variant="subtle"
                                                color="blue"
                                                onClick={() => handleEdit(program)}
                                            >
                                                <Pencil size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleDeleteClick(program)}
                                            >
                                                <Trash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </Paper>

            {/* Modal d'édition/création */}
            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProgram ? 'Modifier la formation' : 'Créer une formation'}
                size="lg"
            >
                <ProgramForm
                    schoolId={schoolId}
                    program={editingProgram}
                    onSuccess={handleSuccess}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal
                opened={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmer la suppression"
                size="sm"
            >
                <Text size="sm" mb="lg">
                    Êtes-vous sûr de vouloir supprimer la formation <strong>{programToDelete?.name}</strong> ?
                    Cette action est irréversible.
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
                        Annuler
                    </Button>
                    <Button color="red" onClick={confirmDelete}>
                        Supprimer
                    </Button>
                </Group>
            </Modal>
        </>
    )
}
