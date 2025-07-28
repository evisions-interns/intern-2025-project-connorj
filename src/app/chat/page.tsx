"use client";
import {
  ChatInput,
  ChatInputTextArea,
  ChatInputSubmit,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, handleSubmit, handleInputChange, input, stop, status } =
    useChat({
      api: "/chat/endpoint",
    });

  const isLoading = status === "submitted";

  return (
    <div className="flex h-dvh flex-1 flex-col overflow-y-auto">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8">
          {messages.map((message) => {
            if (message.role !== "user") {
              return (
                <ChatMessage key={message.id} id={message.id}>
                  <ChatMessageAvatar />
                  <ChatMessageContent content={message.content} />
                </ChatMessage>
              );
            }
            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
              >
                <ChatMessageContent content={message.content} />
              </ChatMessage>
            );
          })}
        </div>
      </ChatMessageArea>
      <div className="mx-auto w-full max-w-2xl px-2 py-4">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          loading={isLoading}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
