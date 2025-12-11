import { useState, useEffect } from 'react'
import { 
  TextInput, 
  Button, 
  Paper, 
  Title, 
  NumberInput, 
  Group, 
  Stack,
  Divider 
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import { StudentScore } from '@/types'
import { ScoreOCR } from './ScoreOCR'

interface ScoreFormProps {
  userId: string
  onSuccess?: () => void
}

interface ExtractedScore {
  subject: string
  score: number
  confidence: number
}

export function ScoreForm({ userId, onSuccess }: ScoreFormProps) {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString())
  const [mathScore, setMathScore] = useState<number>(0)
  const [frenchScore, setFrenchScore] = useState<number>(0)
  const [englishScore, setEnglishScore] = useState<number>(0)
  const [scienceScore, setScienceScore] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [existingScore, setExistingScore] = useState<StudentScore | null>(null)
  const [showOCR, setShowOCR] = useState(false)

  // Calculer la moyenne automatiquement
  const averageScore = (mathScore + frenchScore + englishScore + scienceScore) / 4

  // Charger les scores existants
  useEffect(() => {
    loadExistingScores()
  }, [userId])

  const loadExistingScores = async () => {
    const { data, error } = await supabase
      .from('student_scores')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data && !error) {
      setExistingScore(data)
      setAcademicYear(data.academic_year)
      setMathScore(data.math_score)
      setFrenchScore(data.french_score)
      setEnglishScore(data.english_score)
      setScienceScore(data.science_score)
    }
  }

  const handleOCRScores = (extractedScores: ExtractedScore[]) => {
    // ✅ Pré-remplir le formulaire avec les notes détectées
    extractedScores.forEach(({ subject, score }) => {
      switch (subject) {
        case 'math':
        case 'mathématiques':
          setMathScore(score)
          break
        case 'french':
        case 'français':
        case 'francais':
          setFrenchScore(score)
          break
        case 'english':
        case 'anglais':
          setEnglishScore(score)
          break
        case 'physics':
        case 'chemistry':
        case 'biology':
        case 'science':
        case 'sciences':
          setScienceScore(score)
          break
      }
    })
    
    notifications.show({
      title: 'Notes importées ✓',
      message: `${extractedScores.length} note(s) détectée(s). Vérifiez et corrigez si nécessaire`,
      color: 'green',
    })

    // ✅ Retourner au formulaire après extraction
    setShowOCR(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const scoreData = {
        student_id: userId,
        academic_year: academicYear,
        math_score: mathScore,
        french_score: frenchScore,
        english_score: englishScore,
        science_score: scienceScore,
        average_score: averageScore,
      }

      let error

      if (existingScore) {
        // Mise à jour
        const result = await supabase
          .from('student_scores')
          .update(scoreData)
          .eq('id', existingScore.id)
        error = result.error
      } else {
        // Insertion
        const result = await supabase.from('student_scores').insert(scoreData)
        error = result.error
      }

      if (error) throw error

      notifications.show({
        title: 'Succès',
        message: 'Vos résultats ont été enregistrés',
        color: 'green',
      })

      if (onSuccess) onSuccess()
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

  return (
    <Stack gap="lg">
      {/* ✅ Bouton Toggle OCR/Manuel */}
      <Button 
        variant="light" 
        size="lg"
        onClick={() => setShowOCR(!showOCR)}
        fullWidth
      >
        {showOCR ? '✏️ Saisie manuelle' : '📸 Scanner un bulletin de notes'}
      </Button>

      {/* ✅ Afficher OCR OU formulaire */}
      {showOCR ? (
        <ScoreOCR onScoresExtracted={handleOCRScores} />
      ) : (
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title order={3} mb="md">
            Mes résultats académiques
          </Title>

          <form onSubmit={handleSubmit}>
            <TextInput
              label="Année académique"
              placeholder="2024"
              required
              value={academicYear}
              onChange={(e) => setAcademicYear(e.currentTarget.value)}
            />

            <NumberInput
              label="Note en Mathématiques (/20)"
              required
              mt="md"
              min={0}
              max={20}
              step={0.5}
              value={mathScore}
              onChange={(val) => setMathScore(Number(val))}
            />

            <NumberInput
              label="Note en Français (/20)"
              required
              mt="md"
              min={0}
              max={20}
              step={0.5}
              value={frenchScore}
              onChange={(val) => setFrenchScore(Number(val))}
            />

            <NumberInput
              label="Note en Anglais (/20)"
              required
              mt="md"
              min={0}
              max={20}
              step={0.5}
              value={englishScore}
              onChange={(val) => setEnglishScore(Number(val))}
            />

            <NumberInput
              label="Note en Sciences (/20)"
              required
              mt="md"
              min={0}
              max={20}
              step={0.5}
              value={scienceScore}
              onChange={(val) => setScienceScore(Number(val))}
            />

            <TextInput
              label="Moyenne générale"
              value={averageScore.toFixed(2) + ' /20'}
              readOnly
              mt="md"
              styles={{ input: { fontWeight: 'bold' } }}
            />

            <Group justify="flex-end" mt="xl">
              <Button type="submit" loading={loading}>
                {existingScore ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Group>
          </form>
        </Paper>
      )}
    </Stack>
  )
}
