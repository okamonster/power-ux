"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoadingContext } from "~/providers/loadingProvider";
import useTimerSeconds from "./useTimerSecond";
import { MIME_TYPE } from "~/constants";

const getAudioStream = async (deviceId: string) => {
  return navigator.mediaDevices.getUserMedia({ audio: { deviceId } });
};
const getMediaRecorder = async (stream: MediaStream) => {
  return new MediaRecorder(stream, {
    mimeType: MIME_TYPE,
  });
};

type UseRecordAudioReturn = {
  start: () => void;
  stop: () => void;
  reset: () => void;
  recording: boolean;
  recordTime: number;
  latestRecord: Blob | null;
};

export const useRecordAudio = (
  deviceId: string,
  bufferTime: number
): UseRecordAudioReturn => {
  const { startLoading, stopLoading } = useLoadingContext();
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const streamRef = useRef<MediaStream | null>(null);

  const [latestRecord, setLatestRecord] = useState<Blob | null>(null);
  const {
    time: recordTime,
    running: recording,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimerSeconds();

  // SSR ガード: ブラウザ以外では初期化しない
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof MediaRecorder === "undefined") return;
    let isActive = true;
    (async () => {
      try {
        const stream = await getAudioStream(deviceId);
        streamRef.current = stream;
        // 型サポートチェック（未対応でも MediaRecorder の生成を試す）
        try {
          if (!MediaRecorder.isTypeSupported?.(MIME_TYPE)) {
            // 端末によっては mp4 非対応
            // そのまま生成に失敗したら catch で拾う
          }
        } catch {}
        const mr = await getMediaRecorder(stream);
        if (!isActive) {
          for (const t of stream.getTracks()) {
            t.stop();
          }
          return;
        }
        setMediaRecorder(mr);
      } catch (e) {
        console.error("Failed to init MediaRecorder", e);
        setMediaRecorder(null);
      }
    })();
    return () => {
      isActive = false;
      const s = streamRef.current;
      if (s) {
        for (const t of s.getTracks()) {
          t.stop();
        }
      }
      streamRef.current = null;
      setMediaRecorder(null);
    };
  }, [deviceId]);

  useEffect(() => {
    if (!mediaRecorder) return;

    const onDataavailable = (event: BlobEvent) => {
      setLatestRecord(event.data);
    };
    mediaRecorder.addEventListener("dataavailable", onDataavailable);
    return () => {
      mediaRecorder.removeEventListener("dataavailable", onDataavailable);
    };
  }, [mediaRecorder]);

  const reset = useCallback(() => {
    setLatestRecord(null);
  }, []);

  const start = useCallback(() => {
    if (!mediaRecorder) return;
    reset();
    mediaRecorder.start();
    startTimer();
  }, [mediaRecorder, startTimer, reset]);

  const stop = useCallback(async () => {
    if (!mediaRecorder) return;
    startLoading();
    stopTimer();
    // NOTE:iOS18 Safari対策 1秒余分にレコーディングして再生側で削る
    await new Promise((resolve) => setTimeout(resolve, bufferTime));
    mediaRecorder.stop();
    resetTimer();
    stopLoading();
  }, [
    mediaRecorder,
    stopTimer,
    resetTimer,
    startLoading,
    stopLoading,
    bufferTime,
  ]);

  return {
    start,
    stop,
    reset,
    recording,
    recordTime,
    latestRecord,
  };
};
