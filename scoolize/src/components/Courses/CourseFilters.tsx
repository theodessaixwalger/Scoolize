import {
    Paper,
    Title,
    TextInput,
    Select,
    RangeSlider,
    Text,
    Stack,
    Group,
    Button,
    Collapse,
    Box
} from '@mantine/core'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'

export interface CourseFiltersState {
    search: string
    level: string | null
    minScore: number
}

interface CourseFiltersProps {
    filters: CourseFiltersState
    onChange: (filters: CourseFiltersState) => void
}

export function CourseFilters({ filters, onChange }: CourseFiltersProps) {
    const [opened, setOpened] = useState(false)

    const handleChange = (key: keyof CourseFiltersState, value: any) => {
        onChange({ ...filters, [key]: value })
    }

    return (
        <Paper withBorder p="md" radius="md" mb="md">
            <Group justify="space-between" mb="md">
                <Title order={4}>Filtres</Title>
                <Button
                    variant="subtle"
                    leftSection={<Filter size={16} />}
                    onClick={() => setOpened(!opened)}
                >
                    {opened ? 'Masquer les filtres avancés' : 'Afficher les filtres avancés'}
                </Button>
            </Group>

            <Stack gap="md">
                <TextInput
                    placeholder="Rechercher une formation..."
                    leftSection={<Search size={16} />}
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.currentTarget.value)}
                />

                <Collapse in={opened}>
                    <Stack gap="md">
                        <Select
                            label="Niveau d'études"
                            placeholder="Sélectionner un niveau"
                            data={[
                                { value: 'Licence', label: 'Licence' },
                                { value: 'Master', label: 'Master' },
                                { value: 'Bachelor', label: 'Bachelor' },
                                { value: 'BTS', label: 'BTS' },
                                { value: 'BUT', label: 'BUT' },
                            ]}
                            value={filters.level}
                            onChange={(value) => handleChange('level', value)}
                            clearable
                        />

                        <Box>
                            <Text size="sm" fw={500} mb="xs">Note moyenne minimale requise: {filters.minScore}/20</Text>
                            <RangeSlider
                                min={0}
                                max={20}
                                step={0.5}
                                minRange={0}
                                value={[0, filters.minScore]}
                                onChange={(val) => handleChange('minScore', val[1])}
                                color="blue"
                            />
                        </Box>
                    </Stack>
                </Collapse>
            </Stack>
        </Paper>
    )
}
