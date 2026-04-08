import { useState } from 'react';

import { type Node, useReactFlow } from '@xyflow/react';

import {
  Badge,
  Box,
  Button,
  Code,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { IconApi, IconPlayerPlay } from '@tabler/icons-react';

import BaseNode from '../BaseNode';
import { type ApiCallNodeData } from '../types';

import styles from './styles.module.scss';

type ApiCallNodeTypeProps = Node<ApiCallNodeData, 'api_call'>;

type TestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; message: string };

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const ApiCallNode: React.FC<ApiCallNodeTypeProps> = ({ id, data, selected }) => {
  const { updateNodeData } = useReactFlow();
  const [test, setTest] = useState<TestState>({ status: 'idle' });

  const handleTest = () => {
    if (!data.endpoint) return;
    setTest({ status: 'loading' });
    fetch(data.endpoint, { method: data.method })
      .then((res) => res.text())
      .then((text) => {
        try {
          const json = JSON.parse(text) as Record<string, unknown>;
          setTest({ status: 'success', data: JSON.stringify(json, null, 2) });
        } catch {
          setTest({ status: 'success', data: text });
        }
      })
      .catch((e: unknown) => {
        setTest({ status: 'error', message: e instanceof Error ? e.message : 'Unknown error' });
      });
  };

  const interpolated =
    data.replyTemplate && test.status === 'success'
      ? data.replyTemplate.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
          try {
            const parsed = JSON.parse(test.data) as Record<string, unknown>;
            const val = parsed[key];
            if (val === undefined || val === null) return `{{${key}}}`;
            if (typeof val === 'string') return val;
            if (typeof val === 'number' || typeof val === 'boolean') return String(val);
            return JSON.stringify(val as Record<string, unknown>);
          } catch {
            return `{{${key}}}`;
          }
        })
      : null;

  return (
    <BaseNode id={id} title="API Call" color="orange" icon={<IconApi size={14} />} selected={selected}>
      <Stack gap="xs" className="nodrag">
        <Select
          label="Method"
          description="HTTP method for the request"
          size="xs"
          data={METHODS}
          value={data.method}
          onChange={(v) => {
            updateNodeData(id, { method: v ?? 'GET' });
          }}
          allowDeselect={false}
        />
        <TextInput
          label="Endpoint"
          placeholder="https://api.example.com/orders/{{order_id}}"
          description="URL to call — supports {{variable}} interpolation"
          size="xs"
          value={data.endpoint}
          onChange={(e) => {
            updateNodeData(id, { endpoint: e.currentTarget.value });
          }}
        />

        <Button
          size="xs"
          variant="light"
          color="orange"
          leftSection={<IconPlayerPlay size={12} />}
          loading={test.status === 'loading'}
          disabled={!data.endpoint}
          onClick={handleTest}
        >
          Test
        </Button>

        {test.status === 'loading' && (
          <Group gap="xs">
            <Loader size="xs" color="orange" />
            <Text size="xs" c="dimmed">
              Fetching...
            </Text>
          </Group>
        )}

        {test.status === 'error' && (
          <Box className={styles.resultBox} data-status="error">
            <Text size="xs" c="red">
              {test.message}
            </Text>
          </Box>
        )}

        {test.status === 'success' && (
          <Box className={styles.resultBox} data-status="success">
            <ScrollArea h={100}>
              <Code block fz="10px">
                {test.data}
              </Code>
            </ScrollArea>
          </Box>
        )}

        <Textarea
          label="Reply template"
          placeholder="Your order {{status}} is expected by {{delivery_date}}"
          description="Use {{key}} to interpolate values from the API response"
          size="xs"
          autosize
          minRows={2}
          value={data.replyTemplate ?? ''}
          onChange={(e) => {
            updateNodeData(id, { replyTemplate: e.currentTarget.value });
          }}
        />

        {interpolated && (
          <Box className={styles.resultBox} data-status="preview">
            <Text size="xs" c="dimmed" fw={500} mb={4}>
              Preview
            </Text>
            <Text size="xs">{interpolated}</Text>
          </Box>
        )}

        {data.endpoint && (
          <Group gap={4} wrap="wrap">
            <Badge size="xs" color="orange" variant="filled" className={styles.endpointBadge}>
              {data.method}
            </Badge>
            <Text size="xs" c="dimmed" truncate="end" className={styles.endpointUrl}>
              {data.endpoint}
            </Text>
          </Group>
        )}
      </Stack>
    </BaseNode>
  );
};

export default ApiCallNode;
