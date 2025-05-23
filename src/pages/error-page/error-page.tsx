import { Button, Center, Container, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

type ErrorPageProps = {
  defaultCode?: string;
  defaultMessage?: string;
};

export function ErrorPage({
  defaultCode = '500',
  defaultMessage = 'Something went wrong',
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <Center className="h-screen">
      <Container>
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Title order={1} size="4rem" mb="xl">
            {defaultCode}
          </Title>
          <Text fz="lg" maw="40ch" mb="xl">
            {defaultMessage}
          </Text>
          <Button
            variant="filled"
            color="blue"
            onClick={() => {
              navigate('/', { replace: true });
            }}
          >
            Back to home
          </Button>
        </div>
      </Container>
    </Center>
  );
}