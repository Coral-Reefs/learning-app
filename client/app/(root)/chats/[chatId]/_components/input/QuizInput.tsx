"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, MinusIcon, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useMessageActions } from "@/api/messages";
import { useChat } from "@/hooks/useChat";

// Define Zod schema for form validation
const quizSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(
      z.object({
        text: z.string().min(1, "Option text is required"),
        isCorrect: z.boolean(),
      })
    )
    .min(2, "At least two options are required")
    .refine((options) => options.some((option) => option.isCorrect), {
      message: "At least one option must be marked as correct",
    }),
});

type QuizFormValues = z.infer<typeof quizSchema>;

const QuizInput = () => {
  const { chatId } = useChat();
  const [options, setOptions] = useState([{ text: "", isCorrect: false }]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { createQuiz } = useMessageActions();
  const { mutate: create, isPending } = useMutation({ mutationFn: createQuiz });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      question: "",
      options,
    },
  });

  const handleAddOption = () => {
    const newOptions = [...options, { text: "", isCorrect: false }];
    setOptions(newOptions);
    setValue("options", newOptions);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    setValue("options", newOptions);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
    setValue("options", newOptions);
  };

  const onSubmitHandler = (data: QuizFormValues) => {
    create(
      { chatId, quiz: data },
      {
        onSuccess(data) {
          console.log(data);
          reset();
          setOptions([{ text: "", isCorrect: false }]);
          setIsDialogOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" variant="secondary">
          <PlusCircle /> Create Quiz
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <div>
            <label className="text-sm font-medium">Question</label>
            <Controller
              name="question"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Type your question here..."
                  className="mt-1"
                />
              )}
            />
            {errors.question && (
              <p className="text-red-500 text-xs mt-1">
                {errors.question.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mt-4">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mt-2">
                <Checkbox
                  checked={option.isCorrect}
                  onCheckedChange={() => handleCorrectAnswerChange(index)}
                  aria-label={`Select as correct answer`}
                />
                <Controller
                  name={`options.${index}.text`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      value={option.text}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setOptions((prevOptions) => {
                          const newOptions = [...prevOptions];
                          newOptions[index].text = e.target.value;
                          return newOptions;
                        });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  variant="outline"
                  className="p-1"
                  onClick={() => handleRemoveOption(index)}
                  disabled={options.length <= 2}
                >
                  <MinusIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {errors.options?.message && (
              <p className="text-red-500 text-xs mt-1">
                {errors.options.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={handleAddOption}
              type="button"
              variant="outline"
              className="flex items-center"
              disabled={isPending}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Option
            </Button>
            <Button type="submit" disabled={isPending}>
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizInput;
