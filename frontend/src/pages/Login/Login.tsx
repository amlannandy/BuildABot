import {
  Anchor,
  Button,
  Card,
  Center,
  Image,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { ROUTES } from '@constants/routes';
import logo from '@assets/logo.png';

const Login = () => {
  return (
    <Center h='100vh'>
      <Card shadow='sm' padding='xl' radius='md' w={400}>
        <Center mb='lg'>
          <Image src={logo} w={80} h={80} fit='cover' />
        </Center>

        <Title order={2} mb={4} ta='center'>
          Welcome back
        </Title>
        <Text c='dimmed' size='sm' mb='xl' ta='center'>
          Log in to your account to continue
        </Text>

        <TextInput label='Email' placeholder='you@example.com' mb='md' />
        <PasswordInput label='Password' placeholder='Your password' mb='xl' />

        <Button fullWidth mb='md'>
          Log in
        </Button>

        <Text size='sm' ta='center' c='dimmed'>
          Don't have an account?{' '}
          <Anchor href={ROUTES.REGISTER} size='sm'>
            Sign up
          </Anchor>
        </Text>
      </Card>
    </Center>
  );
};

export default Login;
