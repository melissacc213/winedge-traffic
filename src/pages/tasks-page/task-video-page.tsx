import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Card, 
  Space, 
  Stack, 
  Box, 
  Group, 
  Button, 
  FileButton,
  Center,
  Badge
} from '@mantine/core';
import { PageHeader } from '../../components/page-header/page-header';
import { VideoPlayer } from '../../components/video-player';
import { IconUpload, IconVideo } from '@tabler/icons-react';

export function TaskVideoPage() {
  const { t } = useTranslation(['common', 'recipes']);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const resetRef = useRef<() => void>(null);

  const handleClearFile = () => {
    setUploadedFile(null);
    resetRef.current?.();
  };

  // Sample video in a standard format that most browsers can play
  const sampleVideoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  return (
    <>
      <PageHeader
        title={t('common:taskDashboard')}
        description={t('common:taskDashboardDescription')}
      />
      
      <Container size="xl" py="xl">
        <Title order={2} mb="md">Video Player</Title>
        
        <Card withBorder shadow="sm" mb="xl" p="lg">
          <Stack>
            <Group position="center" my="md">
              <FileButton
                resetRef={resetRef}
                onChange={setUploadedFile}
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
              >
                {(props) => (
                  <Button
                    {...props}
                    leftSection={<IconUpload size={16} />}
                    color="blue"
                    radius="xl"
                  >
                    {t('recipes:creation.importVideo.upload')}
                  </Button>
                )}
              </FileButton>
              
              {uploadedFile && (
                <Button variant="light" color="red" radius="xl" onClick={handleClearFile}>
                  {t('common:button.cancel')}
                </Button>
              )}
            </Group>
            
            {/* Video player section */}
            <Box sx={{ backgroundColor: '#f6f7fb', borderRadius: 8, padding: 20 }}>
              <Stack spacing="xs" align="center" py={20}>
                <Center sx={{ width: '100%' }}>
                  <Box sx={{ width: '100%', maxWidth: 600 }}>
                    <Text fw={500} size="md" mb={2} align="center">
                      {uploadedFile ? uploadedFile.name : "2965398-hd_1920_1080_30fps.mp4"}
                    </Text>
                    <Text size="sm" color="dimmed" mb={15} align="center">
                      {t('recipes:creation.importVideo.selectFrameInstructions')}
                    </Text>
                    
                    <Box 
                      sx={{ 
                        width: '100%',
                        height: 350,
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <VideoPlayer
                        src={!uploadedFile ? sampleVideoSrc : undefined}
                        file={uploadedFile}
                        height={350}
                        showControls
                      />
                    </Box>
                    
                    <Group position="center" mt={20} mb={5}>
                      <Badge color="blue" leftSection={<IconVideo size={12} />}>
                        1080P
                      </Badge>
                      <Badge color="green">2:00</Badge>
                    </Group>
                    
                    <Center>
                      <Button 
                        variant="light" 
                        color="blue"
                        mt={5}
                        size="sm"
                        radius="md"
                      >
                        {t('recipes:creation.importVideo.captureFrame')}
                      </Button>
                    </Center>
                  </Box>
                </Center>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Container>
    </>
  );
}