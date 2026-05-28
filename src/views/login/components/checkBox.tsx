import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const Checkbox = (props: CheckboxProps) => {
	return <input type="checkbox" {...props} />;
};

export { Checkbox };
