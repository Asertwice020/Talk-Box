import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState } from "react";

const InputWrapper = ({ field }) => {
  const { type, value, onChange, id, name, label, placeholder, className } =
    field;
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    onChange({
      // console.log({target: e.target})
      target: {
        name: name,
        value: selectedFile,
      },
    });
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <Label className="cursor-pointer" htmlFor={id}>
        {label}
      </Label>
      {type === "file" ? (
        <Input
          type={type}
          accept="image/*"
          onChange={handleFileChange}
          id={id}
          name={name}
          className={className}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={onChange}
          id={id}
          name={name}
          placeholder={placeholder}
          className={className}
        />
      )}
    </div>
  );
};

export default InputWrapper;