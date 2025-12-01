import { Paper, Title, Text, Button, Group, Stack } from '@mantine/core'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <Stack align="center" gap="xl" mt={60}>
      <Title order={1} size={48} ta="center">
        Bienvenue sur Scoolize
      </Title>
      <Text size="xl" c="dimmed" ta="center" maw={600}>
        La plateforme qui simplifie votre orientation scolaire en matchant vos résultats
        avec les formations qui vous correspondent
      </Text>

      <Group mt="xl">
        <Button size="lg" onClick={() => navigate('/login')}>
          Connexion
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
          Inscription
        </Button>
      </Group>

      <Paper withBorder shadow="md" p="xl" radius="md" mt={40} maw={800}>
        <Title order={3} mb="md">
          Comment ça marche ?
        </Title>
        <Stack gap="md">
          <div>
            <Text fw={700}>📝 Pour les étudiants</Text>
            <Text size="sm" c="dimmed">
              Renseignez vos résultats académiques et découvrez instantanément les formations
              compatibles avec votre profil
            </Text>
          </div>
          <div>
            <Text fw={700}>🏫 Pour les établissements</Text>
            <Text size="sm" c="dimmed">
              Publiez vos programmes et critères de sélection pour attirer les bons candidats
            </Text>
          </div>
          <div>
            <Text fw={700}>🔒 Conforme RGPD</Text>
            <Text size="sm" c="dimmed">
              Vos données sont protégées et vous gardez le contrôle total sur vos informations
            </Text>
          </div>
        </Stack>
      </Paper>
    </Stack>
  )
}
