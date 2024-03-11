type Props = {
  value: string;
  onValueChange: (value: string) => string;
  className: string;
};

export const SupabaseFileUploader = ({ value, onValueChange, className }: Props) => {
  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      />
    </div>
  );
};

export const registerSupabaseFileUploader = {
  name: "MyInput",
  props: {
    value: "string",
    onValueChange: {
      type: "eventHandler",
      argTypes: [
        {
          name: "value",
          type: "string",
        },
      ],
    },
  },
  states: {
    value: {
      type: "writable",
      variableType: "text",
      valueProp: "value",
      onChangeProp: "onValueChange",
    },
  },
};
