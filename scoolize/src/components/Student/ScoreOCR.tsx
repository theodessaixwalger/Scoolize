import { useState } from 'react'
import { Paper, Title, Text, Stack, Alert, LoadingOverlay, FileButton, Button, Select, Checkbox } from '@mantine/core'
import { IconAlertCircle, IconUpload } from '@tabler/icons-react'
import { createWorker } from 'tesseract.js'
import { notifications } from '@mantine/notifications'

interface ExtractedScore {
  subject: string
  score: number
  confidence: number
}

interface ScoreOCRProps {
  onScoresExtracted: (scores: ExtractedScore[]) => void
}

export function ScoreOCR({ onScoresExtracted }: ScoreOCRProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [extractedText, setExtractedText] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [usePreprocessing, setUsePreprocessing] = useState(true)
  const [ocrLanguage, setOcrLanguage] = useState('fra')

  // ✅ Prétraiter l'image pour améliorer la lisibilité
  const preprocessImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      img.onload = () => {
        // ✅ Redimensionner si trop grande
        let width = img.width
        let height = img.height
        const maxSize = 2000

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // ✅ Dessiner l'image
        ctx.drawImage(img, 0, 0, width, height)

        // ✅ Améliorer le contraste et la luminosité
        const imageData = ctx.getImageData(0, 0, width, height)
        const data = imageData.data

        for (let i = 0; i < data.length; i += 4) {
          // Convertir en niveaux de gris
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          
          // Augmenter le contraste (seuil)
          const threshold = 128
          const newValue = gray > threshold ? 255 : 0

          data[i] = newValue     // R
          data[i + 1] = newValue // G
          data[i + 2] = newValue // B
        }

        ctx.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const processImage = async (selectedFile: File | null) => {
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      notifications.show({
        title: 'Fichier invalide',
        message: 'Seules les images sont acceptées',
        color: 'red',
      })
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      notifications.show({
        title: 'Fichier trop lourd',
        message: 'Maximum 10 MB',
        color: 'red',
      })
      return
    }

    setLoading(true)
    setFile(selectedFile)

    try {
      // ✅ Prétraiter l'image si activé
      let imageToProcess: string | File = selectedFile
      
      if (usePreprocessing) {
        imageToProcess = await preprocessImage(selectedFile)
        setPreview(imageToProcess)
      } else {
        setPreview(URL.createObjectURL(selectedFile))
      }

      // ✅ Initialiser Tesseract avec la langue choisie
      const worker = await createWorker(ocrLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`Progression: ${Math.round(m.progress * 100)}%`)
          }
        }
      })

      // ✅ Configurer pour améliorer la précision
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789.,/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸàâäçéèêëîïôöùûüÿ ',
        preserve_interword_spaces: '1',
      })
      
      // ✅ Extraire le texte
      const { data: { text, confidence } } = await worker.recognize(imageToProcess)
      
      console.log('Texte extrait:', text)
      console.log('Confiance:', confidence)
      
      setExtractedText(text)

      // ✅ Parser les notes avec algorithme amélioré
      const scores = parseScoresImproved(text)
      
      if (scores.length === 0) {
        notifications.show({
          title: 'Aucune note détectée',
          message: 'Vérifiez que le bulletin est bien visible et net',
          color: 'orange',
        })
      } else {
        notifications.show({
          title: `✓ ${scores.length} note(s) extraite(s)`,
          message: 'Vérifiez les valeurs avant de valider',
          color: 'green',
        })
        onScoresExtracted(scores)
      }

      await worker.terminate()
    } catch (error) {
      console.error('Erreur OCR:', error)
      notifications.show({
        title: 'Erreur',
        message: 'Impossible de lire l\'image. Essayez une photo plus nette.',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ Algorithme de parsing amélioré
  const parseScoresImproved = (text: string): ExtractedScore[] => {
    const scores: ExtractedScore[] = []
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

    // ✅ Patterns de recherche plus robustes
    const subjectPatterns: { [key: string]: RegExp[] } = {
      'math': [
        /math[eé]matiques?/i,
        /\bmaths?\b/i,
        /calcul/i
      ],
      'french': [
        /fran[cç]ais/i,
        /lettres/i,
        /\bfr\b/i
      ],
      'english': [
        /anglais/i,
        /\bang\b/i,
        /english/i
      ],
      'science': [
        /sciences?/i,
        /physique/i,
        /chimie/i,
        /biologie/i,
        /svt/i,
        /pc/i
      ]
    }

    lines.forEach((line, index) => {
      const lower = line.toLowerCase()
      
      // ✅ Chercher chaque matière
      for (const [subject, patterns] of Object.entries(subjectPatterns)) {
        for (const pattern of patterns) {
          if (pattern.test(lower)) {
            // ✅ Chercher une note sur cette ligne ou les 2 suivantes
            for (let offset = 0; offset <= 2; offset++) {
              if (index + offset >= lines.length) continue
              
              const searchLine = lines[index + offset]
              
              // ✅ Patterns de notes multiples
              const scorePatterns = [
                /(\d{1,2})[.,](\d{1,2})\s*\/\s*20/,  // 15.5/20 ou 15,5/20
                /(\d{1,2})[.,](\d{1,2})\s*$/,        // 15.5 ou 15,5
                /(\d{1,2})\s*\/\s*20/,               // 15/20
                /\b(\d{1,2})\b/,                     // 15
              ]

              for (const scorePattern of scorePatterns) {
                const match = searchLine.match(scorePattern)
                if (match) {
                  let score: number
                  
                  if (match[2]) {
                    // Format 15.5 ou 15,5
                    score = parseFloat(match[1] + '.' + match[2])
                  } else {
                    score = parseFloat(match[1])
                  }

                  // ✅ Vérifier que la note est valide
                  if (score >= 0 && score <= 20) {
                    // ✅ Éviter les doublons
                    const exists = scores.find(s => s.subject === subject)
                    if (!exists) {
                      scores.push({
                        subject,
                        score,
                        confidence: 0.85
                      })
                    }
                    break
                  }
                }
              }
            }
          }
        }
      }
    })

    return scores
  }

  return (
    <Paper p="xl" withBorder>
      <Stack gap="lg">
        <div>
          <Title order={3} mb="xs">
            📸 Scanner un bulletin de notes
          </Title>
          <Text size="sm" c="dimmed">
            Pour de meilleurs résultats : photo nette, bien éclairée, texte horizontal
          </Text>
        </div>

        {/* ✅ Options de configuration */}
        <Stack gap="xs">
          <Checkbox
            label="Activer le prétraitement d'image (améliore la précision)"
            checked={usePreprocessing}
            onChange={(e) => setUsePreprocessing(e.currentTarget.checked)}
          />

          <Select
            label="Langue du bulletin"
            value={ocrLanguage}
            onChange={(val) => setOcrLanguage(val || 'fra')}
            data={[
              { value: 'fra', label: '🇫🇷 Français' },
              { value: 'eng', label: '🇬🇧 Anglais' },
              { value: 'fra+eng', label: '🇫🇷🇬🇧 Français + Anglais' },
            ]}
          />
        </Stack>

        <FileButton 
          onChange={processImage} 
          accept="image/png,image/jpeg,image/jpg"
        >
          {(props) => (
            <Button 
              {...props} 
              leftSection={<IconUpload size={20} />}
              size="lg"
              variant="light"
              fullWidth
              loading={loading}
            >
              Sélectionner une image
            </Button>
          )}
        </FileButton>

        {preview && (
          <Paper p="md" withBorder>
            <Text size="sm" fw={500} mb="xs">
              {usePreprocessing ? '📊 Image prétraitée' : '📷 Image originale'}
            </Text>
            <img 
              src={preview} 
              alt="Aperçu du bulletin" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '500px',
                objectFit: 'contain',
                margin: '0 auto',
                display: 'block',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }} 
            />
          </Paper>
        )}

        {extractedText && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="📝 Texte extrait (vérifiez la qualité)"
            color="blue"
          >
            <Text size="xs" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: '200px', overflow: 'auto' }}>
              {extractedText}
            </Text>
          </Alert>
        )}

        <LoadingOverlay visible={loading} />
      </Stack>
    </Paper>
  )
}
