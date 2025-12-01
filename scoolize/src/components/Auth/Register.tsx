import { useState } from 'react'
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Container, 
  Radio, 
  Group,
  Checkbox
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { supabase } from '@/lib/supabase'
import { UserRole } from '@/types'

export function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gdprConsent) {
      notifications.show({
        title: 'Consentement requis',
        message: 'Vous devez accepter la politique de confidentialité',
        color: 'red',
      })
      return
    }

    setLoading(true)

    try {
      // 1. Créer le compte utilisateur avec les métadonnées
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            gdpr_consent: gdprConsent,
            gdpr_consent_date: new Date().toISOString(),
          }
        }
      })

      if (authError) throw authError

      notifications.show({
        title: 'Inscription réussie',
        message: 'Vérifiez votre email pour confirmer votre compte',
        color: 'green',
      })

      // Rediriger vers la page de connexion ou autre
      // window.location.href = '/login'
      
    } catch (error: any) {
      console.error('Erreur complète:', error)
      notifications.show({
        title: 'Erreur d\'inscription',
        message: error.message,
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center">Inscription à Scoolize</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Créez votre compte pour commencer
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleRegister}>
          <Radio.Group
            value={role}
            onChange={(value) => setRole(value as UserRole)}
            label="Type de compte"
            required
          >
            <Group mt="xs">
              <Radio value="student" label="Étudiant" />
              <Radio value="school" label="École" />
            </Group>
          </Radio.Group>

          <TextInput
            label="Nom complet"
            placeholder="Votre nom"
            required
            mt="md"
            value={fullName}
            onChange={(e) => setFullName(e.currentTarget.value)}
          />

          <TextInput
            label="Email"
            placeholder="vous@exemple.com"
            required
            mt="md"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <PasswordInput
            label="Mot de passe"
            placeholder="Minimum 6 caractères"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Checkbox
            label={
              <Text size="sm">
                J'accepte la collecte et le traitement de mes données conformément au RGPD
              </Text>
            }
            checked={gdprConsent}
            onChange={(e) => setGdprConsent(e.currentTarget.checked)}
            mt="md"
          />

          <Button fullWidth mt="xl" type="submit" loading={loading} disabled={!gdprConsent}>
            S'inscrire
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
