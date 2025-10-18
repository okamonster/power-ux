"use client";

import { Avatar, Group, Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useMemo, useRef } from "react";

type ChatMessage = {
  id: string;
  author: "user" | "assistant";
  content: string;
};

type Props = {
  messages: ChatMessage[];
  className?: string;
  style?: React.CSSProperties;
};

export const ChatScroller = ({ messages, className, style }: Props) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const lastMessageId = useMemo(() => messages.at(-1)?.id, [messages]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport && lastMessageId) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    }
  }, [lastMessageId]);

  return (
    <ScrollArea
      style={{ height: "100%", ...style }}
      viewportRef={viewportRef}
      className={className}
    >
      <Stack p="md" gap="md">
        {messages.map((m) => {
          const isUser = m.author === "user";
          return (
            <Group
              key={m.id}
              align="flex-start"
              justify={isUser ? "flex-end" : "flex-start"}
              wrap="nowrap"
            >
              {!isUser && <Avatar radius="xl">A</Avatar>}
              <Paper
                shadow="xs"
                p="sm"
                withBorder
                radius="md"
                bg={isUser ? "blue.1" : "gray.0"}
              >
                <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                  {m.content}
                </Text>
              </Paper>
              {isUser && (
                <Avatar radius="xl" color="blue">
                  U
                </Avatar>
              )}
            </Group>
          );
        })}
      </Stack>
    </ScrollArea>
  );
};

export type { ChatMessage };
