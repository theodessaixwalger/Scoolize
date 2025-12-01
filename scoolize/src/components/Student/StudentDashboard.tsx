import { useEffect, useState } from 'react'
import { Paper, Title, SimpleGrid, Text, Badge, Group, Stack } from '@mantine/core'
import { supabase } from '@/lib/supabase'

interface DashboardStats {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  averageMatchScore: number
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
  })

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', userId)

    if (data && !error) {
      const stats: DashboardStats = {
        totalApplications: data.length,
        pendingApplications: data.filter((app) => app.status === 'pending').length,
        acceptedApplications: data.filter((app) => app.status === 'accepted').length,
        rejectedApplications: data.filter((app) => app.status === 'rejected').length,
        averageMatchScore:
          data.length > 0
            ? data.reduce((sum, app) => sum + (app.match_score || 0), 0) / data.length
            : 0,
      }
      setStats(stats)
    }
  }

  const statCards = [
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
    {
      title: 'Compatibilité moyenne',
      value: stats.averageMatchScore.toFixed(0) + '%',
      color: 'violet',
    },
  ]

  return (
    <Stack gap="md">
      <Title order={2}>Tableau de bord</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        {statCards.map((card) => (
          <Paper key={card.title} withBorder shadow="sm" p="md" radius="md">
            <Group justify="space-between">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
                {card.title}
              </Text>
            </Group>
            <Text size="xl" fw={700} mt="md">
              {card.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
