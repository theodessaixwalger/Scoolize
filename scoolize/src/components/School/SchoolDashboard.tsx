import { useEffect, useState } from 'react'
import { Paper, Title, SimpleGrid, Text, Table, Badge } from '@mantine/core'
import { supabase } from '@/lib/supabase'

interface SchoolStats {
  totalPrograms: number
  totalApplications: number
  pendingApplications: number
}

interface SchoolDashboardProps {
  schoolId: string
}

export function SchoolDashboard({ schoolId }: SchoolDashboardProps) {
  const [stats, setStats] = useState<SchoolStats>({
    totalPrograms: 0,
    totalApplications: 0,
    pendingApplications: 0,
  })
  const [programs, setPrograms] = useState<any[]>([])

  useEffect(() => {
    loadStats()
    loadPrograms()
  }, [schoolId])

  const loadStats = async () => {
    // Compter les formations
    const { count: programCount } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)

    // Compter les candidatures
    const { data: programIds } = await supabase
      .from('programs')
      .select('id')
      .eq('school_id', schoolId)

    if (programIds) {
      const ids = programIds.map((p) => p.id)
      
      const { count: totalApps } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('program_id', ids)

      const { count: pendingApps } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('program_id', ids)
        .eq('status', 'pending')

      setStats({
        totalPrograms: programCount || 0,
        totalApplications: totalApps || 0,
        pendingApplications: pendingApps || 0,
      })
    }
  }

  const loadPrograms = async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (data && !error) {
      setPrograms(data)
    }
  }

  return (
    <div>
      <Title order={2} mb="md">
        Tableau de bord
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="xl">
        <Paper withBorder shadow="sm" p="md" radius="md">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
            Formations
          </Text>
          <Text size="xl" fw={700} mt="md">
            {stats.totalPrograms}
          </Text>
        </Paper>

        <Paper withBorder shadow="sm" p="md" radius="md">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
            Candidatures totales
          </Text>
          <Text size="xl" fw={700} mt="md">
            {stats.totalApplications}
          </Text>
        </Paper>

        <Paper withBorder shadow="sm" p="md" radius="md">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700}>
            En attente
          </Text>
          <Text size="xl" fw={700} mt="md">
            {stats.pendingApplications}
          </Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder shadow="md" p="md" radius="md">
        <Title order={4} mb="md">
          Mes formations
        </Title>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nom</Table.Th>
              <Table.Th>Niveau</Table.Th>
              <Table.Th>Places</Table.Th>
              <Table.Th>Moyenne min.</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {programs.map((program) => (
              <Table.Tr key={program.id}>
                <Table.Td>{program.name}</Table.Td>
                <Table.Td>
                  <Badge>{program.level}</Badge>
                </Table.Td>
                <Table.Td>{program.available_places}</Table.Td>
                <Table.Td>{program.min_average_score}/20</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </div>
  )
}
