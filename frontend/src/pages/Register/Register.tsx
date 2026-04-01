import { Anchor, Button, Card, Center, Image, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { ROUTES } from '@constants/routes';
import logo from '@assets/logo.png';

const Register = () => {
  return (
    <Center h='100vh'>
      <Card shadow='sm' padding='xl' radius='md' w={400}>
        <Center mb='lg'>
          <Image src={logo} w={80} h={80} fit='cover' />
        </Center>

        <Title order={2} mb={4} ta='center'>Create an account</Title>
        <Text c='dimmed' size='sm' mb='xl' ta='center'>Start building your bots today</Text>

        <TextInput label='Name' placeholder='Your name' mb='md' />
        <TextInput label='Email' placeholder='you@example.com' mb='md' />
        <PasswordInput label='Password' placeholder='Your password' mb='md' />
        <PasswordInput label='Confirm Password' placeholder='Confirm your password' mb='xl' />

        <Button fullWidth mb='md'>Create account</Button>

        <Text size='sm' ta='center' c='dimmed'>
          Already have an account?{' '}
          <Anchor href={ROUTES.LOGIN} size='sm'>Log in</Anchor>
        </Text>
      </Card>
    </Center>
  );
};

export default Register;
