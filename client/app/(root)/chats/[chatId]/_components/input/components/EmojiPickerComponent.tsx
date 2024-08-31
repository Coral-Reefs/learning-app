import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Laugh } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

type Props = {
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>;
  form: UseFormReturn<{ content: string }, any, undefined>;
};

const EmojiPickerComponent = ({ textareaRef, form }: Props) => {
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen(!emojiPickerOpen);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        emojiPickerOpen &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target as Node) &&
        (e.target as HTMLElement).id !== "emoji-open"
      ) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [emojiPickerOpen]);

  const addEmojiHandler = (emoji: any) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionEnd || 0;
    const text = form.getValues("content");
    const newText =
      text.slice(0, cursorPos) + emoji.emoji + text.slice(cursorPos);

    form.setValue("content", newText);

    setTimeout(() => {
      const newCursorPos = cursorPos + emoji.emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div>
      <div ref={emojiPickerRef} className="absolute bottom-14">
        <EmojiPicker
          onEmojiClick={addEmojiHandler}
          open={emojiPickerOpen}
          autoFocusSearch={false}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleEmojiPicker}
      >
        <Laugh />
      </Button>
    </div>
  );
};

export default EmojiPickerComponent;
