import { useMessageActions } from "@/api/messages";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { useMutation } from "@tanstack/react-query";
import { Mic, Pause, Play, SendHorizontal, Trash2 } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import WaveSurfer from "wavesurfer.js";

type Props = {
  hide: Dispatch<SetStateAction<boolean>>;
  replying: any;
  setReplying: any;
};

const CaptureAudio = ({ hide, replying, setReplying }: Props) => {
  //   const [{ userInfo, currentChatUser, socket }, dispatch] = useStateProvider();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [waveform, setWaveform] = useState<any>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedAudio, setRenderedAudio] = useState<File | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  const audioRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const waveformRef = useRef(null);

  const { chatId } = useChat();
  const { createMessage } = useMessageActions();
  const { mutate: send, isPending } = useMutation({
    mutationFn: createMessage,
  });

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prevDuration) => {
          setTotalDuration(prevDuration + 1);
          return prevDuration + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    const wavesurfer: any = WaveSurfer.create({
      container: waveformRef.current!,
      waveColor: "#ccc",
      progressColor: "#4a9eff",
      cursorColor: "#7ae3c3",
      barWidth: 2,
      height: 30,
    });
    setWaveform(wavesurfer);

    wavesurfer.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      wavesurfer.destroy();
    };
  }, []);

  useEffect(() => {
    if (waveform) handleStartRecording();
  }, [waveform]);

  const handleStartRecording = () => {
    setRecordingDuration(0);
    setCurrentPlaybackTime(0);
    setTotalDuration(0);
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioRef.current.srcObject = stream;

        const chunks: BlobPart[] | undefined = [];
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
          const audioURL = URL.createObjectURL(blob);
          const audio = new Audio(audioURL);
          setRecordedAudio(audio);
          waveform.load(audioURL);
        };
        mediaRecorder.start();
      })
      .catch((e) => {
        console.log(e);
        setIsRecording(false);
        toast.error("Cannot find audio devices");
        hide(false);
      });
  };
  const handleStopRecording = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        waveform.stop();

        const audioChunks: any[] = [];
        mediaRecorderRef.current.addEventListener("dataavailable", (e: any) => {
          audioChunks.push(e.data);
        });

        mediaRecorderRef.current.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
          const audioFile = new File([audioBlob], "recording.mp3");
          setRenderedAudio(audioFile);
          stopAudioDevices();
          resolve();
        });

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        waveform.stop();
      } else {
        resolve();
      }
    });
  };

  const stopAudioDevices = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        devices.forEach((device) => {
          if (device.kind === "audioinput") {
            navigator.mediaDevices
              .getUserMedia({ [device.kind.split("input")[0]]: true })
              .then((stream) => {
                stream.getTracks().forEach((track) => track.stop());
              });
          }
        });
      });
    }
  };

  useEffect(() => {
    if (recordedAudio) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(recordedAudio.currentTime);
      };
      recordedAudio.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        recordedAudio.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [recordedAudio]);

  const handlePlayRecording = () => {
    if (recordedAudio) {
      waveform.stop();
      waveform.play();
      recordedAudio.play();
      setIsPlaying(true);
    }
  };
  const handlePauseRecording = () => {
    waveform.stop();
    recordedAudio!.pause();
    setIsPlaying(false);
  };
  const handleSendRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    }

    if (!renderedAudio) return;
    const payload = {
      chatId,
      message: {
        file: renderedAudio,
        type: "voice",
        ...(replying ? { reply: replying._id } : {}),
      },
    };
    console.log(payload);
    send(payload, {
      onSuccess(data) {
        hide(false);
        setReplying(null);
        console.log(data);
      },
      onError(e) {
        console.log(e);
      },
    });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex text-2xl w-full justify-end items-center">
      <Button onClick={() => hide(false)} size="icon" variant="destructive">
        <Trash2 />
      </Button>
      <div className="mx-4 py-2.5 px-4 text-primary-foreground text-lg flex gap-3 justify-center items-center bg-secondary-foreground rounded-full drop-shadow-lg">
        {isRecording ? (
          <div className="text-red-500 animate-pulse w-60 text-center">
            Recording <span>{formatTime(recordingDuration)}</span>
          </div>
        ) : (
          recordedAudio && (
            <div>
              {!isPlaying ? (
                <Play onClick={handlePlayRecording} />
              ) : (
                <Pause onClick={handlePauseRecording} />
              )}
            </div>
          )
        )}
        <div
          className="w-full lg:w-60"
          ref={waveformRef}
          hidden={isRecording}
        />
        {recordedAudio && isPlaying && (
          <span>{formatTime(currentPlaybackTime)}</span>
        )}
        {recordedAudio && !isPlaying && (
          <span>{formatTime(totalDuration)}</span>
        )}
        <audio ref={audioRef} hidden />
      </div>
      <div className="mr-4">
        {!isRecording ? (
          <Button size="icon" variant="ghost" onClick={handleStartRecording}>
            <Mic className="text-red-500" />
          </Button>
        ) : (
          <Button size="icon" variant="ghost" onClick={handleStopRecording}>
            <Pause className="text-red-500" />
          </Button>
        )}
      </div>
      <Button size="icon" variant="ghost" onClick={handleSendRecording}>
        <SendHorizontal />
      </Button>
    </div>
  );
};

export default CaptureAudio;
