"use client";

import { useState, useCallback, useMemo } from "react";
import { Box, Button, Group, Stack, Textarea, Title } from "@mantine/core";
import { ChatScroller, type ChatMessage } from "../ChatScroller";
import styles from "./style.module.css";

export const ChatContainer = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      author: "assistant",
      content: "こんにちは！今日は何をしますか？",
    },
    {
      id: "m2",
      author: "user",
      content: "チャット画面のモックを試したいです。",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      author: "user",
      content: text,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    // 簡易なモック返信
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          author: "assistant",
          content: "了解しました！モックです。",
        },
      ]);
    }, 400);
  }, [input]);

  const isSendDisabled = useMemo(() => input.trim().length === 0, [input]);

  return (
    <div className={styles.chatContainer}>
      <Stack h="100%" gap="xs">
        <Title order={4} pl="md" pt="md">
          Chat
        </Title>
        <Box className={styles.scrollerBox}>
          <ChatScroller messages={messages} />
        </Box>
        <Box className={styles.inputBar}>
          <Group align="flex-end" gap="sm">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              placeholder="メッセージを入力..."
              autosize
              minRows={1}
              maxRows={4}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button onClick={handleSend} disabled={isSendDisabled}>
              送信
            </Button>
          </Group>
        </Box>
      </Stack>
    </div>
  );
};
