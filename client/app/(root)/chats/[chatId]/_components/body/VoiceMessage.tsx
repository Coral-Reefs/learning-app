import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import { Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type Props = { file: any };

const VoiceMessage = ({ file }: Props) => {
  const [audioMessage, setAudioMessage] = useState<HTMLAudioElement | null>(
    null
  );
  const [isWaveSurferReady, setIsWaveSurferReady] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const waveformRef = useRef(null);
  const waveform = useRef<any>(null);

  useEffect(() => {
    if (waveform.current === null) {
      console.log("Initializing WaveSurfer");
      waveform.current = WaveSurfer.create({
        container: waveformRef.current!,
        waveColor: "#ccc",
        progressColor: "#4a9eff",
        cursorColor: "#7ae3c3",
        barWidth: 2,
        height: 40,
      });
    }

    waveform.current.on("finish", () => {
      setIsPlaying(false);
      waveform.current.stop();
    });

    return () => {
      if (isWaveSurferReady && waveform.current) {
        waveform.current.destroy();
      }
    };
  }, [isWaveSurferReady]);

  useEffect(() => {
    const audioURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/${file.name}`;
    const audio = new Audio(audioURL);
    setAudioMessage(audio);
    waveform.current.load(audioURL);
    waveform.current.on("ready", () => {
      setIsWaveSurferReady(true);
      setTotalDuration(waveform.current.getDuration());
    });
  }, [file]);

  useEffect(() => {
    if (audioMessage) {
      const updatePlaybackTime = () => {
        setCurrentPlaybackTime(audioMessage.currentTime);
      };
      audioMessage.addEventListener("timeupdate", updatePlaybackTime);
      return () => {
        audioMessage.removeEventListener("timeupdate", updatePlaybackTime);
      };
    }
  }, [audioMessage]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handlePlayAudio = () => {
    if (audioMessage) {
      //   waveform.current.stop();
      waveform.current.play();
      audioMessage.play();
      setIsPlaying(true);
    }
  };
  const handlePauseAudio = () => {
    waveform.current.pause();
    audioMessage!.pause();
    setIsPlaying(false);
  };
  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-12 h-12"
        >
          {!isPlaying ? (
            <Play onClick={handlePlayAudio} />
          ) : (
            <Pause onClick={handlePauseAudio} />
          )}
        </Button>
        <div>
          <div className="w-full sm:w-60" ref={waveformRef} />
          {audioMessage && (
            <span className="text-xs opacity-70">
              {isPlaying
                ? formatTime(currentPlaybackTime)
                : formatTime(totalDuration)}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default VoiceMessage;
