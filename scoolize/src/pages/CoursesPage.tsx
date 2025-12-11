import { useEffect, useState } from 'react'
import { Container, Title, Text } from '@mantine/core'
import { supabase } from '@/lib/supabase'
import { CourseFilters, CourseFiltersState } from '@/components/Courses/CourseFilters'
import { CourseList, ProgramWithSchool } from '@/components/Courses/CourseList'
import { notifications } from '@mantine/notifications'

export function CoursesPage() {
    const [programs, setPrograms] = useState<ProgramWithSchool[]>([])
    const [filteredPrograms, setFilteredPrograms] = useState<ProgramWithSchool[]>([])
    const [loading, setLoading] = useState(true)
    const [availableRegions, setAvailableRegions] = useState<string[]>([])
    const [filters, setFilters] = useState<CourseFiltersState>({
        search: '',
        level: null,
        region: null,
        minScore: 20,
    })

    useEffect(() => {
        fetchPrograms()
    }, [])

    useEffect(() => {
        if (programs.length > 0) {
            const regions = Array.from(new Set(programs.map(p => p.schools?.location).filter(Boolean))) as string[]
            setAvailableRegions(regions.sort())
        }
    }, [programs])

    useEffect(() => {
        applyFilters()
    }, [filters, programs])

    const fetchPrograms = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('programs')
                .select('*, schools(*)')

            if (error) throw error

            // Cast data to ProgramWithSchool[] assuming the join works as expected
            setPrograms(data as unknown as ProgramWithSchool[])
        } catch (error: any) {
            console.error('Error fetching programs:', error)
            notifications.show({
                title: 'Erreur',
                message: 'Impossible de charger les formations',
                color: 'red',
            })
        } finally {
            setLoading(false)
        }
    }

    const applyFilters = () => {
        let result = [...programs]

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.schools?.name.toLowerCase().includes(searchLower)
            )
        }

        // Level filter
        if (filters.level) {
            result = result.filter(p => p.level === filters.level)
        }

        // Region filter
        if (filters.region) {
            result = result.filter(p => p.schools?.location === filters.region)
        }

        // Score filter
        if (filters.minScore > 0) {
            result = result.filter(p => (p.min_average_score || 0) <= filters.minScore)
        }

        setFilteredPrograms(result)
    }

    return (
        <Container size="xl" py="xl">
            <Title order={2} mb="xl">Formations disponibles</Title>

            <CourseFilters
                filters={filters}
                onChange={setFilters}
                availableRegions={availableRegions}
            />

            <Text size="sm" c="dimmed" mb="md" mt="xl">
                {filteredPrograms.length} formation{filteredPrograms.length > 1 ? 's' : ''} trouvée{filteredPrograms.length > 1 ? 's' : ''}
            </Text>
            <CourseList programs={filteredPrograms} loading={loading} />
        </Container>
    )
}
