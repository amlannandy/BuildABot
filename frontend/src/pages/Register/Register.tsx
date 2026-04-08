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
import { notifications } from '@mantine/notifications';

import logo from '@assets/logo.png';
import { ROUTES } from '@constants/routes';
import { useAuth } from '@context/auth';
import { useRegister } from '@hooks/auth/useRegister';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '@utils/auth';

const Register = () => {
  const { authenticate } = useAuth();
  const { mutate: handleRegister, isPending: isRegistering } = useRegister();

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: validateName,
      email: validateEmail,
      password: validatePassword,
      confirmPassword: validateConfirmPassword,
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    handleRegister(
      {
        name: values.name,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (data) => {
          const token = data.data;
          notifications.show({
            title: 'Registration Successful',
            message: 'Welcome to BuildABot!',
            color: 'green',
          });
          authenticate(token);
        },
        onError: (error) => {
          const errorMessage = error.errors[0] || 'Something went wrong';
          notifications.show({
            title: 'Registration Failed',
            message: errorMessage,
            color: 'red',
          });
        },
      },
    );
  });

  return (
    <Center h="100vh">
      <Card shadow="sm" padding="xl" radius="md" w={400}>
        <Center mb="lg">
          <Image src={logo} w={80} h={80} fit="cover" />
        </Center>

        <Title order={2} mb={4} ta="center">
          Create an account
        </Title>
        <Text c="dimmed" size="sm" mb="xl" ta="center">
          Start building your bots today
        </Text>

        <form onSubmit={handleSubmit}>
          <TextInput label="Name" placeholder="Your name" mb="md" {...form.getInputProps('name')} />
          <TextInput
            label="Email"
            placeholder="you@example.com"
            mb="md"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            mb="md"
            {...form.getInputProps('password')}
          />
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            mb="xl"
            {...form.getInputProps('confirmPassword')}
          />

          <Button fullWidth mb="md" type="submit" loading={isRegistering}>
            Create account
          </Button>
        </form>

        <Text size="sm" ta="center" c="dimmed">
          Already have an account?{' '}
          <Anchor href={ROUTES.LOGIN} size="sm">
            Log in
          </Anchor>
        </Text>
      </Card>
    </Center>
  );
};

export default Register;
