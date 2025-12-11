import { useEffect, useState } from 'react'
import { Paper, Title, SimpleGrid, Text, Stack, Loader, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  averageMatchScore: number
  eligiblePrograms: number
  totalPrograms: number
}

interface StudentDashboardProps {
  userId: string
}

export function StudentDashboard({ userId }: StudentDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    averageMatchScore: 0,
    eligiblePrograms: 0,
    totalPrograms: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Stats des candidatures
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('student_id', userId)

      if (appError) throw appError

      // Stats des formations compatibles (nouvelle vue)
      const { data: programs, error: progError } = await supabase
        .from('student_program_matches')
        .select('match_score, is_eligible')
        .eq('student_id', userId)

      if (progError) throw progError

      const eligibleCount = programs?.filter(p => p.is_eligible).length || 0
      const avgScore = programs && programs.length > 0
        ? programs.reduce((sum, p) => sum + p.match_score, 0) / programs.length
        : 0

      setStats({
        totalApplications: applications?.length || 0,
        pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
        acceptedApplications: applications?.filter(app => app.status === 'accepted').length || 0,
        rejectedApplications: applications?.filter(app => app.status === 'rejected').length || 0,
        averageMatchScore: avgScore,
        eligiblePrograms: eligibleCount,
        totalPrograms: programs?.length || 0,
      })
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="lg" />
        <Text>Chargement...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Erreur" color="red">
        {error}
      </Alert>
    )
  }

  const statCards = [
    {
      title: 'Formations éligibles',
      value: `${stats.eligiblePrograms}/${stats.totalPrograms}`,
      color: 'green',
    },
    {
      title: 'Total candidatures',
      value: stats.totalApplications,
      color: 'blue',
    },
    {
      title: 'En attente',
      value: stats.pendingApplications,
      color: 'orange',
    },
    {
      title: 'Acceptées',
      value: stats.acceptedApplications,
      color: 'green',
    },
  ]

  return (
    <Stack gap="md">
      <Title order={2}>Tableau de bord</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {statCards.map((card) => (
          <Paper key={card.title} withBorder shadow="sm" p="md" radius="md">
            <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
              {card.title}
            </Text>
            <Text size="xl" fw={700} mt="md">
              {card.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
