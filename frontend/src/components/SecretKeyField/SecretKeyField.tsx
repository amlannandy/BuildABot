import { useState } from 'react';

import { IconCheck, IconCopy, IconEye, IconEyeOff } from '@tabler/icons-react';

import { ActionIcon, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';

interface SecretKeyFieldProps {
  label: string;
  value: string;
}

const SecretKeyField = ({ label, value }: SecretKeyFieldProps) => {
  const [visible, setVisible] = useState(false);
  const clipboard = useClipboard({ timeout: 1500 });

  const masked = value.slice(0, 6) + '••••••••••••••••••••' + value.slice(-4);

  return (
    <Stack gap={6}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <Group gap="xs" align="center">
        <TextInput
          value={visible ? value : masked}
          readOnly
          style={{ flex: 1 }}
          styles={{ input: { fontFamily: 'monospace', fontSize: 13 } }}
        />
        <Tooltip label={visible ? 'Hide' : 'Show'}>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => {
              setVisible((v) => !v);
            }}
          >
            {visible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
          </ActionIcon>
        </Tooltip>
        <Tooltip label={clipboard.copied ? 'Copied!' : 'Copy'}>
          <ActionIcon
            variant="subtle"
            color={clipboard.copied ? 'green' : 'gray'}
            onClick={() => {
              clipboard.copy(value);
            }}
          >
            {clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
};

export default SecretKeyField;
