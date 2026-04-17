export async function sendWidgetMessage(
  apiUrl: string,
  chatbotId: number,
  apiKey: string,
  message: string,
  userIdentifier: string,
): Promise<string> {
  const res = await fetch(`${apiUrl}/chatbots/${chatbotId.toString()}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, user_identifier: userIdentifier, api_key: apiKey }),
  });
  if (!res.ok) {
    throw new Error('Error sending message');
  }
  const json = (await res.json()) as {
    data: {
      reply: string;
    };
  };
  return json.data.reply;
}
