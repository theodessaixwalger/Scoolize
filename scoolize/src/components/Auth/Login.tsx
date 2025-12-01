import { useState } from 'react'
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      notifications.show({
        title: 'Connexion réussie',
        message: 'Bienvenue sur Scoolize !',
        color: 'green',
      })
    } catch (error: any) {
      notifications.show({
        title: 'Erreur de connexion',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Connexion à Scoolize</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Connectez-vous pour accéder à votre espace
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput
            label="Email"
            placeholder="vous@exemple.com"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <PasswordInput
            label="Mot de passe"
            placeholder="Votre mot de passe"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Se connecter
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
