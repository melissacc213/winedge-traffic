import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { 
  Container, 
  Title, 
  Text, 
  Grid, 
  Card, 
  Stack, 
  Box, 
  Group, 
  Button, 
  FileButton,
  Center,
  Badge,
  Paper,
  useMantineTheme,
  ThemeIcon,
} from '@mantine/core';
import { 
  IconUpload, 
  IconVideo, 
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCamera,
  IconPhoto,
} from '@tabler/icons-react';
import { PageHeader } from '../../components/page-header/page-header';
import { useTheme } from '../../providers/theme-provider';
import useImage from 'use-image';
import type { FrameData } from '../../types/recipe';

const STAGE_WIDTH = 600;
const STAGE_HEIGHT = 400;

export function TaskVideoPage() {
  const { t } = useTranslation(['common', 'recipes']);
  const mantineTheme = useMantineTheme();
  const { theme, colorScheme } = useTheme();
  
  // State management
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<FrameData | null>(null);
  const [showFrame, setShowFrame] = useState(false);
  
  // Refs
  const resetRef = useRef<() => void>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Konva image for captured frame
  const [konvaImage] = useImage(capturedFrame?.imageDataUrl || '');

  // Sample video
  const sampleVideoSrc = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Theme color utility function
  const getThemeColor = (colorPath: string): string => {
    const [colorName, index] = colorPath.split('.');
    
    if (colorName === 'ui') {
      return theme.other?.ui?.[index] || colorPath;
    }
    
    if (colorName === 'backgrounds') {
      return theme.other?.backgrounds?.[index] || colorPath;
    }
    
    if (colorName === 'taskTypes') {
      const path = theme.other?.taskTypes?.[index];
      if (path) {
        return getThemeColor(path);
      }
      return colorPath;
    }
    
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };

  // Handle file upload
  const handleFileChange = (file: File | null) => {
    if (file) {
      setUploadedFile(file);
      const localUrl = URL.createObjectURL(file);
      setVideoUrl(localUrl);
      setCapturedFrame(null);
      setShowFrame(false);
    }
  };

  // Handle clear file
  const handleClearFile = () => {
    if (videoUrl && uploadedFile) {
      URL.revokeObjectURL(videoUrl);
    }
    setUploadedFile(null);
    setVideoUrl(null);
    setCapturedFrame(null);
    setShowFrame(false);
    resetRef.current?.();
  };

  // Handle frame capture
  const handleCaptureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = STAGE_WIDTH;
      canvas.height = STAGE_HEIGHT;
      ctx.drawImage(video, 0, 0, STAGE_WIDTH, STAGE_HEIGHT);
      
      const imageDataUrl = canvas.toDataURL('image/png');
      const frame: FrameData = {
        imageDataUrl,
        frameTime: video.currentTime,
        objects: [],
      };
      
      setCapturedFrame(frame);
      setShowFrame(true);
    }
  };

  // Step frame forward/backward
  const stepFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;
    const fps = 25;
    const delta = 1 / fps;
    video.currentTime += direction === 'forward' ? delta : -delta;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl && uploadedFile) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  // Get current video source
  const currentVideoSrc = videoUrl || (!uploadedFile ? sampleVideoSrc : null);

  return (
    <>
      <PageHeader
        title={t('common:taskDashboard')}
        description={t('common:taskDashboardDescription')}
      />
      
      <Container size="xl" py="xl">
        <Title order={2} mb="md">{t('recipes:creation.importVideo.title')}</Title>
        
        <Card withBorder shadow="sm" p="lg">
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <Stack>
            <Group justify="center" mb="md">
              <FileButton
                resetRef={resetRef}
                onChange={handleFileChange}
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
                <Button 
                  variant="light" 
                  color="red" 
                  radius="xl" 
                  onClick={handleClearFile}
                  leftSection={<IconRefresh size={16} />}
                >
                  {t('common:button.change')}
                </Button>
              )}

              {capturedFrame && (
                <Button
                  variant="outline"
                  radius="xl"
                  onClick={() => setShowFrame(!showFrame)}
                  leftSection={showFrame ? <IconVideo size={16} /> : <IconPhoto size={16} />}
                >
                  {showFrame ? 'View Video' : 'View Frame'}
                </Button>
              )}
            </Group>
            
            {/* Video/Frame display section */}
            <Paper 
              p="md"
              radius="md"
              style={{
                backgroundColor: colorScheme === 'dark' ? getThemeColor('gray.8') : getThemeColor('gray.0'),
              }}
            >
              <Stack align="center">
                <Text fw={500} size="md" mb={2}>
                  {uploadedFile ? uploadedFile.name : "Sample Video"}
                </Text>
                <Text size="sm" c="dimmed" mb={15}>
                  {capturedFrame && showFrame 
                    ? `Frame captured at ${capturedFrame.frameTime.toFixed(2)}s`
                    : t('recipes:creation.importVideo.selectFrameInstructions')
                  }
                </Text>
                
                {capturedFrame && showFrame ? (
                  <Card withBorder radius="md" p="lg">
                    <Stage
                      width={STAGE_WIDTH}
                      height={STAGE_HEIGHT}
                      style={{
                        background: colorScheme === 'dark' 
                          ? getThemeColor('gray.8') 
                          : getThemeColor('gray.1'),
                        borderRadius: 8,
                        cursor: 'grab',
                      }}
                    >
                      <Layer>
                        {konvaImage && (
                          <KonvaImage
                            image={konvaImage}
                            width={STAGE_WIDTH}
                            height={STAGE_HEIGHT}
                          />
                        )}
                      </Layer>
                    </Stage>
                    
                    <Center mt="md">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCapturedFrame(null);
                          setShowFrame(false);
                        }}
                        leftSection={<IconCamera size={16} />}
                      >
                        Recapture Frame
                      </Button>
                    </Center>
                  </Card>
                ) : currentVideoSrc ? (
                  <Stack
                    gap="md"
                    p="md"
                    style={{
                      borderRadius: 12,
                      backgroundColor: colorScheme === 'dark' 
                        ? getThemeColor('gray.8') 
                        : getThemeColor('gray.0'),
                      boxShadow: `0 4px 12px ${theme.other?.ui?.shadow || 'rgba(0,0,0,0.1)'}`,
                    }}
                  >
                    <video
                      ref={videoRef}
                      src={currentVideoSrc}
                      controls
                      style={{
                        width: STAGE_WIDTH,
                        height: STAGE_HEIGHT,
                        backgroundColor: colorScheme === 'dark' 
                          ? getThemeColor('gray.9') 
                          : '#000',
                        borderRadius: 8,
                        objectFit: 'contain',
                      }}
                    />

                    <Group justify="space-between">
                      <Group gap="xs">
                        <Button
                          leftSection={<IconChevronLeft size={16} />}
                          size="sm"
                          variant="outline"
                          onClick={() => stepFrame('backward')}
                        >
                          Prev Frame
                        </Button>
                        <Button
                          rightSection={<IconChevronRight size={16} />}
                          size="sm"
                          variant="outline"
                          onClick={() => stepFrame('forward')}
                        >
                          Next Frame
                        </Button>
                      </Group>

                      <Button
                        size="sm"
                        variant="filled"
                        onClick={handleCaptureFrame}
                        leftSection={<IconCamera size={16} />}
                      >
                        {t('recipes:creation.importVideo.captureFrame')}
                      </Button>
                    </Group>
                  </Stack>
                ) : (
                  <Center 
                    style={{ 
                      height: STAGE_HEIGHT,
                      backgroundColor: colorScheme === 'dark' 
                        ? getThemeColor('gray.8') 
                        : getThemeColor('gray.1'),
                      borderRadius: 8,
                    }}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                        <IconVideo size={32} />
                      </ThemeIcon>
                      <Text c="dimmed">No video loaded</Text>
                    </Stack>
                  </Center>
                )}
                
                {currentVideoSrc && (
                  <Group justify="center" mt="md" gap="xs">
                    <Badge color="blue" leftSection={<IconVideo size={12} />}>
                      {uploadedFile ? 'Custom' : 'Sample'} Video
                    </Badge>
                    {capturedFrame && (
                      <Badge color="green">
                        Frame: {capturedFrame.frameTime.toFixed(2)}s
                      </Badge>
                    )}
                  </Group>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Card>
      </Container>
    </>
  );
}