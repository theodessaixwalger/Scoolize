import { useEffect, useState } from 'react'
import {
  Paper,
  Title,
  Text,
  Badge,
  Group,
  Stack,
  Button,
  Loader,
  Alert,
  SimpleGrid,
  RingProgress,
  Accordion,
  List,
  ThemeIcon,
} from '@mantine/core'
import {
  IconAlertCircle,
  IconCheck,
  IconX,
  IconSchool,
  IconMapPin,
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

// ✅ INTERFACES TYPÉES
interface MatchDetail {
  criterion: string
  required?: number
  obtained?: number
  status: 'passed' | 'failed'
  points: number
}

interface MissingRequirement {
  criterion: string
  required?: number
  obtained?: number
}

interface MatchData {
  score: number
  total_points: number
  obtained_points: number
  details: MatchDetail[]
  missing_requirements: MissingRequirement[]
}

interface ProgramMatch {
  program_id: string
  program_name: string
  school_name: string
  location: string
  match_score: number
  is_eligible: boolean
  match_data: MatchData
}

interface MatchingResultsProps {
  studentId: string
  onApply: (programId: string, matchScore: number) => void
}

export function MatchingResults({ studentId, onApply }: MatchingResultsProps) {
  const [programs, setPrograms] = useState<ProgramMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMatches()
  }, [studentId])

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: matchError } = await supabase
        .from('student_program_matches')
        .select('*')
        .eq('student_id', studentId)
        .order('match_score', { ascending: false })

      if (matchError) throw matchError

      setPrograms(data || [])
    } catch (err) {
      console.error('Erreur chargement matches:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Stack align="center" p="xl">
        <Loader size="lg" />
        <Text>Analyse des compatibilités...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        {error}
      </Alert>
    )
  }

  if (programs.length === 0) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="blue">
        Aucune formation compatible trouvée. Complétez votre profil pour obtenir des recommandations.
      </Alert>
    )
  }

  const eligiblePrograms = programs.filter(p => p.is_eligible)
  const ineligiblePrograms = programs.filter(p => !p.is_eligible)

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Formations compatibles</Title>
        <Badge size="lg" variant="light">
          {eligiblePrograms.length} éligible{eligiblePrograms.length > 1 ? 's' : ''}
        </Badge>
      </Group>

      {eligiblePrograms.length > 0 && (
        <>
          <Title order={3} c="green">✅ Formations éligibles</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {eligiblePrograms.map(program => (
              <ProgramCard
                key={program.program_id}
                program={program}
                onApply={onApply}
              />
            ))}
          </SimpleGrid>
        </>
      )}

      {ineligiblePrograms.length > 0 && (
        <>
          <Title order={3} c="orange" mt="xl">⚠️ Formations non éligibles</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }}>
            {ineligiblePrograms.map(program => (
              <ProgramCard
                key={program.program_id}
                program={program}
                onApply={onApply}
              />
            ))}
          </SimpleGrid>
        </>
      )}
    </Stack>
  )
}

// ✅ COMPOSANT CARTE PROGRAMME
function ProgramCard({ 
  program, 
  onApply 
}: { 
  program: ProgramMatch
  onApply: (programId: string, matchScore: number) => void 
}) {
  const matchPercentage = Math.min(100, Math.round(program.match_score))

  return (
    <Paper shadow="sm" p="lg" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb="xs">
              <IconSchool size={20} />
              <Text fw={700} size="lg">{program.program_name}</Text>
            </Group>
            <Text size="sm" c="dimmed">{program.school_name}</Text>
            <Group gap="xs" mt="xs">
              <IconMapPin size={16} />
              <Text size="sm">{program.location}</Text>
            </Group>
          </div>

          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: matchPercentage, color: program.is_eligible ? 'green' : 'orange' }]}
            label={
              <Text size="xs" ta="center" fw={700}>
                {matchPercentage}%
              </Text>
            }
          />
        </Group>

        <Badge
          size="lg"
          variant="light"
          color={program.is_eligible ? 'green' : 'orange'}
          fullWidth
        >
          {program.is_eligible ? '✓ Éligible' : '⚠️ Non éligible'}
        </Badge>

        <Accordion variant="contained">
          <Accordion.Item value="details">
            <Accordion.Control>Détails de compatibilité</Accordion.Control>
            <Accordion.Panel>
              <Text size="sm" c="dimmed" mb="sm">
                Score: {program.match_data.obtained_points}/{program.match_data.total_points} points
              </Text>

              <Text fw={500} mt="md">Critères évalués:</Text>
              <List>
                {program.match_data.details.map((detail, index) => (
                  <List.Item
                    key={index}
                    icon={
                      <ThemeIcon
                        color={detail.status === 'passed' ? 'green' : 'red'}
                        size={24}
                        radius="xl"
                      >
                        {detail.status === 'passed' ? <IconCheck size={16} /> : <IconX size={16} />}
                      </ThemeIcon>
                    }
                  >
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>{detail.criterion}</Text>
                        {detail.required && detail.obtained && (
                          <Text size="xs" c="dimmed">
                            Requis: {detail.required}/20 | Obtenu: {detail.obtained}/20
                          </Text>
                        )}
                      </div>
                      <Badge color={detail.status === 'passed' ? 'green' : 'red'}>
                        {Math.round(detail.points)} pts
                      </Badge>
                    </Group>
                  </List.Item>
                ))}
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>

        {!program.is_eligible && program.match_data.missing_requirements.length > 0 && (
          <Alert color="orange" title="Critères non remplis">
            <Stack gap="xs">
              {program.match_data.missing_requirements.map((req, idx) => (
                <Group key={idx} justify="space-between">
                  <Text size="sm" fw={500}>{req.criterion}</Text>
                  {req.required && req.obtained && (
                    <Badge color="orange" variant="light">
                      {req.obtained}/{req.required}
                    </Badge>
                  )}
                </Group>
              ))}
            </Stack>
          </Alert>
        )}

        <Button
          fullWidth
          variant={program.is_eligible ? 'filled' : 'light'}
          onClick={() => onApply(program.program_id, program.match_score)}
        >
          {program.is_eligible ? 'Candidater' : 'Candidater quand même'}
        </Button>
      </Stack>
    </Paper>
  )
}
