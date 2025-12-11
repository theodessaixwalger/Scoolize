import { useState, useEffect, useRef } from 'react'
import { Tabs, Container, Title, Text, Loader, Center } from '@mantine/core'
import { SchoolProgramsList } from '@/components/School/SchoolProgramsList'
import { SchoolDashboard } from '@/components/School/SchoolDashboard'
import { supabase } from '@/lib/supabase'
import { notifications } from '@mantine/notifications'

interface SchoolPageProps {
  userId: string
}

export function SchoolPage({ userId }: SchoolPageProps) {
  const [schoolId, setSchoolId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isLoading = useRef(false) // ← EMPÊCHE LE DOUBLE CHARGEMENT

  useEffect(() => {
    if (isLoading.current) return // ← SI DÉJÀ EN COURS, ON SORT
    loadSchool()
  }, [userId])

  const loadSchool = async () => {
    if (isLoading.current) return // ← SÉCURITÉ SUPPLÉMENTAIRE
    isLoading.current = true

    try {
      console.log('🔍 Recherche de l\'école pour userId:', userId)

      // 1. Chercher la fiche école (SANS .single() pour voir combien il y en a)
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name')
        .eq('profile_id', userId)

      console.log('🏫 Schools trouvées:', schoolData?.length, schoolData)
      console.log('❌ School error:', schoolError)

      if (schoolError) {
        throw schoolError
      }

      // 2. Si plusieurs fiches, on prend la première et on supprime les autres
      if (schoolData && schoolData.length > 1) {
        console.warn('⚠️ Plusieurs fiches école détectées, nettoyage...')

        const mainSchool = schoolData[0]
        const duplicateIds = schoolData.slice(1).map(s => s.id)

        // Supprimer les doublons
        const { error: deleteError } = await supabase
          .from('schools')
          .delete()
          .in('id', duplicateIds)

        if (deleteError) {
          console.error('Erreur suppression doublons:', deleteError)
        }

        setSchoolId(mainSchool.id)
        notifications.show({
          title: 'Nettoyage effectué',
          message: `${duplicateIds.length} doublon(s) supprimé(s)`,
          color: 'yellow',
        })
      }
      // 3. Si une seule fiche, parfait
      else if (schoolData && schoolData.length === 1) {
        setSchoolId(schoolData[0].id)
        console.log('✅ École trouvée:', schoolData[0].id)
      }
      // 4. Si aucune fiche, on la crée
      else if (!schoolData || schoolData.length === 0) {
        console.log('⚠️ Aucune fiche école, création...')

        // Récupérer le nom du profil
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single()

        console.log('👤 Profile:', profile)

        // Créer la fiche école
        const { data: newSchool, error: createError } = await supabase
          .from('schools')
          .insert({
            profile_id: userId,
            name: profile?.full_name || 'Mon école',
          })
          .select('id')
          .single()

        console.log('✅ New school:', newSchool)
        console.log('❌ Create error:', createError)

        if (createError) {
          // Si erreur de conflit (la fiche existe déjà), on recharge
          if (createError.code === '23505') {
            console.log('⚠️ Fiche déjà créée, rechargement...')
            const { data: existingSchool } = await supabase
              .from('schools')
              .select('id')
              .eq('profile_id', userId)
              .single()

            if (existingSchool) {
              setSchoolId(existingSchool.id)
            }
          } else {
            throw new Error(`Impossible de créer la fiche école: ${createError.message}`)
          }
        } else if (newSchool) {
          setSchoolId(newSchool.id)
          notifications.show({
            title: 'Compte école créé',
            message: 'Votre espace école est prêt !',
            color: 'green',
          })
        }
      }
    } catch (err: any) {
      console.error('❌ Erreur complète:', err)
      setError(err.message)
      notifications.show({
        title: 'Erreur',
        message: err.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
      isLoading.current = false
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <div style={{ textAlign: 'center' }}>
          <Loader size="lg" />
          <Text mt="md">Chargement de votre espace école...</Text>
        </div>
      </Center>
    )
  }

  if (error) {
    return (
      <Container>
        <Title order={2} c="red">Erreur</Title>
        <Text>{error}</Text>
        <Text size="sm" c="dimmed" mt="md">
          Vérifiez les logs de la console pour plus d'informations
        </Text>
      </Container>
    )
  }

  if (!schoolId) {
    return (
      <Container>
        <Title order={2}>École non trouvée</Title>
        <Text>Impossible de charger votre espace école.</Text>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Tabs defaultValue="dashboard">
        <Tabs.List>
          <Tabs.Tab value="dashboard">Tableau de bord</Tabs.Tab>
          <Tabs.Tab value="programs">Mes formations</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="xl">
          <SchoolDashboard schoolId={schoolId} />
        </Tabs.Panel>

        <Tabs.Panel value="programs" pt="xl">
          <SchoolProgramsList schoolId={schoolId} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
