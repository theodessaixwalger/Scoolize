import { Tabs } from '@mantine/core'
import { ScoreForm } from '@/components/Student/ScoreForm'
import { MatchingResults } from '@/components/Student/MatchingResults'
import { StudentDashboard } from '@/components/Student/StudentDashboard'
import { StudentApplicationsList } from '@/components/Student/StudentApplicationsList'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase' // ✅ AJOUTER CET IMPORT

interface StudentPageProps {
  userId: string
}

export function StudentPage({ userId }: StudentPageProps) {
  // ✅ REMPLACER CETTE FONCTION
  const handleApply = async (programId: string, matchScore: number) => {
    try {
      // ✅ Vérifier si déjà candidaté
      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('student_id', userId)
        .eq('program_id', programId)
        .single()

      if (existing) {
        notifications.show({
          title: 'Déjà candidaté',
          message: 'Vous avez déjà postulé à cette formation',
          color: 'orange',
        })
        return
      }

      // ✅ Créer la candidature
      const { error } = await supabase
        .from('applications')
        .insert({
          student_id: userId,
          program_id: programId,
          status: 'pending',
          match_score: matchScore,
        })

      if (error) throw error

      notifications.show({
        title: 'Candidature envoyée ✓',
        message: 'Votre candidature a été enregistrée avec succès',
        color: 'green',
      })

    } catch (error: any) {
      console.error('Erreur candidature:', error)
      
      if (error.code === '23505') {
        notifications.show({
          title: 'Déjà candidaté',
          message: 'Vous avez déjà postulé à cette formation',
          color: 'orange',
        })
      } else {
        notifications.show({
          title: 'Erreur',
          message: error.message || 'Impossible de candidater',
          color: 'red',
        })
      }
    }
  }

  return (
    <Tabs defaultValue="dashboard">
      <Tabs.List>
        <Tabs.Tab value="dashboard">Tableau de bord</Tabs.Tab>
        <Tabs.Tab value="scores">Mes résultats</Tabs.Tab>
        <Tabs.Tab value="matching">Formations compatibles</Tabs.Tab>
        <Tabs.Tab value="applications">Mes candidatures</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="dashboard" pt="xl">
        <StudentDashboard userId={userId} />
      </Tabs.Panel>

      <Tabs.Panel value="scores" pt="xl">
        <ScoreForm userId={userId} />
      </Tabs.Panel>

      <Tabs.Panel value="matching" pt="xl">
        <MatchingResults 
          studentId={userId} 
          onApply={handleApply} 
        />
      </Tabs.Panel>

      <Tabs.Panel value="applications" pt="xl">
        <StudentApplicationsList userId={userId} />
      </Tabs.Panel>
    </Tabs>
  )
}
