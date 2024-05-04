import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import InputWrapper from "./InputWrapper";

const CardWrapper = ({
  outerStyle,
  title,
  titleLabel,
  inputFields,
  onSubmit,
  children,
}) => {
  // console.log(outerStyle, title, titleLabel, inputFields, onSubmit, children);

  let handleSubmit;
  useEffect(() => {
    if (onSubmit) {
      handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(); // Handle async operations in onSubmit
      };
      return () => handleSubmit; // Cleanup function for potential async operations
    }
  }, [onSubmit]);

  return (
    <div className={outerStyle}>
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="font-[700] text-3xl">{title}</CardTitle>
          <CardDescription className="text-sm">{titleLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {inputFields.map((field, index) => (
              <InputWrapper key={index} field={field} />
            ))}
          </form>
        </CardContent>
          {children}
      </Card>
    </div>
  );
};

export default CardWrapper;