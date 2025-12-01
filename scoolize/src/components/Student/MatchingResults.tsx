import { useEffect, useState } from 'react'
import { 
  Paper, 
  Title, 
  Text, 
  Badge, 
  Group, 
  Stack, 
  Button, 
  Progress,
  List
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import { MatchingProgram } from '@/types'

interface MatchingResultsProps {
  userId: string
}

export function MatchingResults({ userId }: MatchingResultsProps) {
  const [programs, setPrograms] = useState<MatchingProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatchingPrograms()
  }, [userId])

  const loadMatchingPrograms = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_matching_programs', {
        student_uuid: userId,
      })

      if (error) throw error

      setPrograms(data || [])
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

  const handleApply = async (programId: string, matchScore: number) => {
    try {
      const { error } = await supabase.from('applications').insert({
        student_id: userId,
        program_id: programId,
        match_score: matchScore,
        status: 'pending',
      })

      if (error) throw error

      notifications.show({
        title: 'Candidature envoyée',
        message: 'Votre candidature a été enregistrée',
        color: 'green',
      })
    } catch (error: any) {
      if (error.code === '23505') {
        notifications.show({
          title: 'Déjà candidaté',
          message: 'Vous avez déjà postulé à cette formation',
          color: 'orange',
        })
      } else {
        notifications.show({
          title: 'Erreur',
          message: error.message,
          color: 'red',
        })
      }
    }
  }

  if (loading) {
    return <Text>Chargement des formations...</Text>
  }

  if (programs.length === 0) {
    return (
      <Paper withBorder shadow="md" p={30} radius="md">
        <Title order={3} mb="md">
          Formations compatibles
        </Title>
        <Text c="dimmed">
          Aucune formation trouvée. Veuillez d'abord enregistrer vos résultats académiques.
        </Text>
      </Paper>
    )
  }

  return (
    <Paper withBorder shadow="md" p={30} radius="md">
      <Title order={3} mb="md">
        Formations compatibles ({programs.length})
      </Title>

      <Stack gap="md">
        {programs.map((program) => (
          <Paper key={program.program_id} withBorder p="md" radius="md">
            <Group justify="space-between" mb="sm">
              <div>
                <Text fw={700} size="lg">
                  {program.program_name}
                </Text>
                <Text size="sm" c="dimmed">
                  {program.school_name} • {program.school_location}
                </Text>
                {program.level && (
                  <Badge size="sm" mt={5}>
                    {program.level}
                  </Badge>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xl" fw={700} c={program.requirements_met ? 'green' : 'orange'}>
                  {program.match_score}%
                </Text>
                <Text size="xs" c="dimmed">
                  Compatibilité
                </Text>
              </div>
            </Group>

            <Progress
              value={program.match_score}
              color={program.requirements_met ? 'green' : 'orange'}
              size="sm"
              mb="sm"
            />

            {!program.requirements_met && program.missing_requirements.length > 0 && (
              <Paper bg="red.0" p="xs" radius="sm" mb="sm">
                <Text size="sm" fw={500} mb={5}>
                  Critères non remplis :
                </Text>
                <List size="sm">
                  {program.missing_requirements.map((req, idx) => (
                    <List.Item key={idx}>{req}</List.Item>
                  ))}
                </List>
              </Paper>
            )}

            <Group justify="flex-end">
              <Button
                variant={program.requirements_met ? 'filled' : 'outline'}
                onClick={() => handleApply(program.program_id, program.match_score)}
              >
                {program.requirements_met ? 'Candidater' : 'Candidater quand même'}
              </Button>
            </Group>
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
