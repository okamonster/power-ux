"use client";

import { useEffect, useMemo } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import styles from "./style.module.css";
import { useRecordAudio } from "~/features/record/hooks/useRecordAudio";

export default function RecordPage(): React.ReactNode {
  const { start, stop, reset, recording, recordTime, latestRecord } =
    useRecordAudio("default", 0);

  const audioUrl = useMemo(
    () => (latestRecord ? URL.createObjectURL(latestRecord) : null),
    [latestRecord]
  );
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);
  const canPlay = useMemo(() => !!audioUrl, [audioUrl]);

  return (
    <div className={styles.container}>
      <Title order={4} className={styles.header}>
        録音
      </Title>

      <Stack gap="md">
        <Card withBorder radius="md" p="lg">
          <Text size="sm" c="dimmed">
            プレビュー
          </Text>
          {canPlay ? (
            <audio
              className={styles.audio}
              controls
              aria-label="録音プレビュー"
            >
              <source src={audioUrl ?? undefined} />
              <track
                kind="captions"
                src="data:text/vtt,WEBVTT"
                label="captions"
                default
              />
            </audio>
          ) : (
            <Text size="sm" c="gray">
              録音するとここにプレビューが表示されます。
            </Text>
          )}
        </Card>

        <Group justify="center" gap="xl" className={styles.controls}>
          {!recording ? (
            <ActionIcon
              size="xl"
              radius="xl"
              color="red"
              variant="filled"
              onClick={start}
            >
              <span style={{ fontWeight: 700 }}>REC</span>
            </ActionIcon>
          ) : (
            <ActionIcon
              size="xl"
              radius="xl"
              color="gray"
              variant="filled"
              onClick={stop}
            >
              <span style={{ fontWeight: 700 }}>STOP</span>
            </ActionIcon>
          )}
          <Button variant="light" onClick={reset} disabled={!canPlay}>
            取り直す
          </Button>
        </Group>

        <Text ta="center" c="dimmed">
          {recordTime}s
        </Text>
      </Stack>
    </div>
  );
}
