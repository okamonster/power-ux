"use client";

import { Button, Group, Textarea } from "@mantine/core";
import { IoMdSend } from "react-icons/io";
import styles from "./style.module.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export const ChatFooter = ({
  value,
  onChange,
  onSend,
}: Props): React.ReactNode => {
  const isSendDisabled = value.trim().length === 0;

  return (
    <div className={styles.footerRoot}>
      <Group align="flex-end" gap="sm">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="メッセージを入力..."
          autosize
          minRows={1}
          maxRows={4}
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button onClick={onSend} disabled={isSendDisabled}>
          <IoMdSend size={20} />
        </Button>
      </Group>
    </div>
  );
};
