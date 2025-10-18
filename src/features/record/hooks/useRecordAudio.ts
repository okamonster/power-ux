"use client";
import { useCallback, useEffect, useState } from "react";
import { useLoadingContext } from "~/providers/loadingProvider";
import useTimerSeconds from "./useTimerSecond";
import { MIME_TYPE } from "~/constants";
import useSWR from "swr";

const getAudioStream = async (deviceId: string) => {
  return navigator.mediaDevices.getUserMedia({ audio: { deviceId } });
};
const getMediaRecorder = async (stream: MediaStream) => {
  return new MediaRecorder(stream, {
    mimeType: MIME_TYPE,
  });
};
const getMediaRecorderByDeviceId = async (deviceId: string) => {
  const stream = await getAudioStream(deviceId);
  return getMediaRecorder(stream);
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
  const { data: mediaRecorder } = useSWR(
    ["audioStream", deviceId],
    () => getMediaRecorderByDeviceId(deviceId),
    { suspense: false, revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false }
  );

  const [latestRecord, setLatestRecord] = useState<Blob | null>(null);
  const {
    time: recordTime,
    running: recording,
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
  } = useTimerSeconds();

  if (!MediaRecorder.isTypeSupported(MIME_TYPE)) {
    console.error(`${MIME_TYPE} is not supported`);
  }

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
