import { useState, useEffect } from 'react'
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  NumberInput,
  Group,
  Select
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import { Program } from '@/types'

interface ProgramFormProps {
  schoolId: string
  program?: Program | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function ProgramForm({ schoolId, program, onSuccess, onCancel }: ProgramFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<string | null>('Licence')
  const [durationYears, setDurationYears] = useState<number>(3)
  const [minMathScore, setMinMathScore] = useState<number>(10)
  const [minFrenchScore, setMinFrenchScore] = useState<number>(10)
  const [minEnglishScore, setMinEnglishScore] = useState<number>(10)
  const [minScienceScore, setMinScienceScore] = useState<number>(10)
  const [minAverageScore, setMinAverageScore] = useState<number>(10)
  const [availablePlaces, setAvailablePlaces] = useState<number>(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (program) {
      setName(program.name)
      setDescription(program.description || '')
      setLevel(program.level || 'Licence')
      setDurationYears(program.duration_years || 3)
      setMinMathScore(program.min_math_score || 10)
      setMinFrenchScore(program.min_french_score || 10)
      setMinEnglishScore(program.min_english_score || 10)
      setMinScienceScore(program.min_science_score || 10)
      setMinAverageScore(program.min_average_score || 10)
      setAvailablePlaces(program.available_places || 30)
    }
  }, [program])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const programData = {
        school_id: schoolId,
        name,
        description,
        level,
        duration_years: durationYears,
        min_math_score: minMathScore,
        min_french_score: minFrenchScore,
        min_english_score: minEnglishScore,
        min_science_score: minScienceScore,
        min_average_score: minAverageScore,
        available_places: availablePlaces,
      }

      let error
      if (program) {
        const { error: updateError } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', program.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('programs')
          .insert(programData)
        error = insertError
      }

      if (error) throw error

      notifications.show({
        title: program ? 'Formation modifiée' : 'Formation créée',
        message: program ? 'La formation a été mise à jour avec succès' : 'La formation a été ajoutée avec succès',
        color: 'green',
      })

      if (!program) {
        // Réinitialiser le formulaire seulement si création
        setName('')
        setDescription('')
        // Reset other fields to defaults if needed, but keeping them as is is often fine for bulk entry
      }

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
    <Paper withBorder shadow="md" p={30} radius="md">
      <Title order={3} mb="md">
        {program ? 'Modifier la formation' : 'Créer une formation'}
      </Title>

      <form onSubmit={handleSubmit}>
        <TextInput
          label="Nom de la formation"
          placeholder="Licence en Informatique"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <Textarea
          label="Description"
          placeholder="Décrivez la formation..."
          mt="md"
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />

        <Group grow mt="md">
          <Select
            label="Niveau"
            data={['Licence', 'Master', 'Doctorat', 'BTS', 'BUT']}
            value={level}
            onChange={setLevel}
          />
          <NumberInput
            label="Durée (années)"
            min={1}
            max={5}
            value={durationYears}
            onChange={(val) => setDurationYears(Number(val))}
          />
        </Group>

        <Title order={5} mt="xl" mb="md">
          Critères d'admission (notes minimales /20)
        </Title>

        <Group grow>
          <NumberInput
            label="Mathématiques"
            min={0}
            max={20}
            step={0.5}
            value={minMathScore}
            onChange={(val) => setMinMathScore(Number(val))}
          />
          <NumberInput
            label="Français"
            min={0}
            max={20}
            step={0.5}
            value={minFrenchScore}
            onChange={(val) => setMinFrenchScore(Number(val))}
          />
        </Group>

        <Group grow mt="md">
          <NumberInput
            label="Anglais"
            min={0}
            max={20}
            step={0.5}
            value={minEnglishScore}
            onChange={(val) => setMinEnglishScore(Number(val))}
          />
          <NumberInput
            label="Sciences"
            min={0}
            max={20}
            step={0.5}
            value={minScienceScore}
            onChange={(val) => setMinScienceScore(Number(val))}
          />
        </Group>

        <Group grow mt="md">
          <NumberInput
            label="Moyenne générale"
            min={0}
            max={20}
            step={0.5}
            value={minAverageScore}
            onChange={(val) => setMinAverageScore(Number(val))}
          />
          <NumberInput
            label="Places disponibles"
            min={1}
            value={availablePlaces}
            onChange={(val) => setAvailablePlaces(Number(val))}
          />
        </Group>

        <Group justify="flex-end" mt="xl">
          {onCancel && (
            <Button variant="default" onClick={onCancel} disabled={loading}>
              Annuler
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {program ? 'Mettre à jour' : 'Créer la formation'}
          </Button>
        </Group>
      </form>
    </Paper>
  )
}
