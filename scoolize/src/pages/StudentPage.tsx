import { Tabs } from '@mantine/core'
import { ScoreForm } from '@/components/Student/ScoreForm'
import { MatchingResults } from '@/components/Student/MatchingResults'
import { StudentDashboard } from '@/components/Student/StudentDashboard'

interface StudentPageProps {
  userId: string
}

export function StudentPage({ userId }: StudentPageProps) {
  return (
    <Tabs defaultValue="dashboard">
      <Tabs.List>
        <Tabs.Tab value="dashboard">Tableau de bord</Tabs.Tab>
        <Tabs.Tab value="scores">Mes résultats</Tabs.Tab>
        <Tabs.Tab value="matching">Formations compatibles</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="xl">
        <StudentDashboard userId={userId} />
      </Tabs.Panel>

      <Tabs.Panel value="scores" pt="xl">
        <ScoreForm userId={userId} />
      </Tabs.Panel>

      <Tabs.Panel value="matching" pt="xl">
        <MatchingResults userId={userId} />
      </Tabs.Panel>
    </Tabs>
  )
}
