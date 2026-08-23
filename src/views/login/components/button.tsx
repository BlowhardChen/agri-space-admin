import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline";
	size?: "default" | "lg";
}

/** 渲染登录页统一样式的操作按钮。 */
const Button = ({ children, type = "button", ...props }: PropsWithChildren<ButtonProps>) => {
	// 渲染 `Button` 的 JSX 模板。
	return (
		<button type={type} {...props}>
			{children}
		</button>
	);
};

export { Button };
