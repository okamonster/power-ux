"use client";

import { DefaultHeader } from "~/components/Navigations/DefaultHeader";
import { ChatFooter } from "~/features/chat/components/ChatFooter";
import { ChatScroller } from "~/features/chat/components/ChatScroller";
import type { ChatMessage } from "~/features/chat/components/ChatScroller";
import { useState, useCallback } from "react";
import styles from "./style.module.css";

export const ChatContainer = (): React.ReactNode => {
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

  return (
    <div className={styles.chatContainer}>
      <DefaultHeader title="Chat" />
      <ChatScroller messages={messages} />

      <ChatFooter value={input} onChange={setInput} onSend={handleSend} />
    </div>
  );
};
