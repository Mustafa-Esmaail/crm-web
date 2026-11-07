/** Form-level errors: messages the API sent for fields the form does not render. */
export function FormAlert({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className="bg-destructive-soft text-small text-destructive space-y-1 rounded-md px-3 py-2"
    >
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
