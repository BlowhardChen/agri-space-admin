import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline";
	size?: "default" | "lg";
}

const Button = ({ children, type = "button", ...props }: PropsWithChildren<ButtonProps>) => {
	return (
		<button type={type} {...props}>
			{children}
		</button>
	);
};

export { Button };
