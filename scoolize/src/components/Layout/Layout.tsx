import { AppShell, Burger, Group, Title, Button, Menu, Avatar, ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ReactNode } from 'react'
import { Sun, Moon } from 'lucide-react'

import { Profile } from '../../types'

interface LayoutProps {
  children: ReactNode
  userEmail?: string | null
  profile?: Profile | null
}

export default function Layout({ children, userEmail, profile }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const navigate = useNavigate()
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
              🎓 Scoolize
            </Title>
          </Group>

          <Group>
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </ActionIcon>

            {userEmail ? (
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <Button variant="subtle" leftSection={<Avatar size="sm" radius="xl" />}>
                    {profile?.full_name || userEmail}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>Mon compte</Menu.Label>
                  <Menu.Item onClick={() => navigate('/dashboard')}>
                    Tableau de bord
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color="red" onClick={handleLogout}>
                    Déconnexion
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <Group>
                <Button variant="subtle" onClick={() => navigate('/login')}>
                  Connexion
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Inscription
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={4} mb="md">Menu</Title>
        <Button
          variant="subtle"
          fullWidth
          justify="flex-start"
          onClick={() => navigate('/')}
        >
          Accueil
        </Button>
        {userEmail && (
          <>
            <Button
              variant="subtle"
              fullWidth
              justify="flex-start"
              onClick={() => navigate('/dashboard')}
            >
              Tableau de bord
            </Button>
            <Button
              variant="subtle"
              fullWidth
              justify="flex-start"
              onClick={() => navigate('/courses')}
            >
              Formations disponibles
            </Button>
          </>
        )}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
