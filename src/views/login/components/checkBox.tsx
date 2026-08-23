import type { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** 渲染登录页统一样式的复选框。 */
const Checkbox = (props: CheckboxProps) => {
	// 渲染 `Checkbox` 的 JSX 模板。
	return <input type="checkbox" {...props} />;
};

export { Checkbox };
