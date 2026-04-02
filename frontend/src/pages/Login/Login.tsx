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
import { useForm } from '@mantine/form';
import { ROUTES } from '@constants/routes';
import logo from '@assets/logo.png';
import { useLogin } from '@hooks/auth/useLogin';
import type { ApiErrorResponse } from '@dto/api';
import { notifications } from '@mantine/notifications';
import { handleAuthenticationSuccess } from '@api/utils';

const Login = () => {
  const { mutate, isPending } = useLogin();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    mutate(values, {
      onSuccess: (data) => {
        const token = data.data;
        handleAuthenticationSuccess(token);
        notifications.show({
          title: 'Login Successful',
          message: 'Welcome back to BuildABot!',
          color: 'green',
        });
      },
      onError: (error: ApiErrorResponse) => {
        const errorMessage = error.errors?.[0] || 'Something went wrong';
        notifications.show({
          title: 'Login Failed',
          message: errorMessage,
          color: 'red',
        });
      },
    });
  });

  return (
    <Center h="100vh">
      <Card shadow="sm" padding="xl" radius="md" w={400}>
        <Center mb="lg">
          <Image src={logo} w={80} h={80} fit="cover" />
        </Center>

        <Title order={2} mb={4} ta="center">
          Welcome back
        </Title>
        <Text c="dimmed" size="sm" mb="xl" ta="center">
          Log in to your account to continue
        </Text>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            mb="md"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mb="xl"
            {...form.getInputProps('password')}
          />
          <Button type="submit" fullWidth mb="md" loading={isPending}>
            Log in
          </Button>
        </form>

        <Text size="sm" ta="center" c="dimmed">
          Don't have an account?{' '}
          <Anchor href={ROUTES.REGISTER} size="sm">
            Sign up
          </Anchor>
        </Text>
      </Card>
    </Center>
  );
};

export default Login;
