import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMessageActions } from "@/api/messages";
import { Progress } from "@/components/ui/progress";
import { CircleCheck, CircleX } from "lucide-react";
import { useChat } from "@/hooks/useChat";

type Props = {
  quiz: any;
};

const Quiz = ({ quiz }: Props) => {
  const { chatId } = useChat();
  const [selectedOption, setSelectedOption] = useState<string | undefined>(
    undefined
  );
  const { answerQuiz } = useMessageActions();
  const { mutate: answer, isPending } = useMutation({ mutationFn: answerQuiz });
  const queryClient = useQueryClient();

  const handleOptionChange = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const onSubmitHandler = () => {
    if (selectedOption) {
      answer(
        { id: quiz._id, optionId: selectedOption },
        {
          onSuccess() {
            queryClient.refetchQueries({ queryKey: ["quizzes"] });
            setSelectedOption(undefined);
          },
          onError(error) {
            console.log(error);
          },
        }
      );
    }
  };

  const calculateOptionPercentage = (optionId: string) => {
    const totalAnswers = quiz.answers.length;
    const optionAnswers = quiz.answers.filter(
      (answer: any) => answer.answer === optionId
    ).length;
    return totalAnswers ? (optionAnswers / totalAnswers) * 100 : 0;
  };

  return (
    <Card className="p-5 border w-full lg:w-[50%] mx-auto space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-lg">{quiz.question}</CardTitle>
        <CardDescription>
          by {quiz.user.firstName} {quiz.user.lastName}
        </CardDescription>
      </CardHeader>

      {!quiz.isAnswered && !quiz.fromCurrentUser ? (
        <RadioGroup
          className="space-y-2"
          value={selectedOption}
          onValueChange={handleOptionChange}
        >
          {quiz.options.map((option: any) => (
            <div key={option._id} className="flex items-center space-x-2">
              <RadioGroupItem value={option._id} />
              <Label>{option.text}</Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        quiz.options.map((option: any) => (
          <div key={option._id} className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <span>{calculateOptionPercentage(option._id).toFixed(0)}%</span>
              <Label>{option.text}</Label>
            </div>
            <div className="flex items-center gap-3">
              {quiz.answers.some(
                (answer: any) =>
                  answer.user === quiz.user._id && answer.answer === option._id
              ) ||
              quiz.fromCurrentUser ||
              quiz.isAnswered ? (
                option.isCorrect ? (
                  <CircleCheck className="text-green-500 w-4" />
                ) : (
                  <CircleX className="text-red-500 w-4" />
                )
              ) : (
                <CircleX className="invisible" />
              )}
              <Progress value={calculateOptionPercentage(option._id)} />
            </div>
          </div>
        ))
      )}

      {!quiz.isSubmitted && !quiz.fromCurrentUser && (
        <Button
          onClick={onSubmitHandler}
          className="mt-4"
          disabled={!selectedOption || isPending}
        >
          Submit
        </Button>
      )}
      <CardFooter className="p-0 flex justify-center text-sm">
        {quiz.answers.length} answers
      </CardFooter>
    </Card>
  );
};

export default Quiz;
