import { useState } from "react";
import LoginForm from "./components/LoginForm";
import LoginShowcase from "./components";
import SwitchDark from "@/components/SwitchDark";
import "./index.less";

const Login = () => {
	const [activeField, setActiveField] = useState<"username" | "password" | null>(null);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [hasPassword, setHasPassword] = useState(false);

	return (
		<div className="login-container">
			<div className="login-box">
				<SwitchDark />
				<div className="login-left">
					<div className="login-brand">
						<div className="brand-mark" aria-hidden="true">
							<span className="brand-mark__leaf brand-mark__leaf--left" />
							<span className="brand-mark__leaf brand-mark__leaf--right" />
							<span className="brand-mark__leaf brand-mark__leaf--top" />
							<span className="brand-mark__stem" />
						</div>
						<div className="brand-copy">
							<strong>农域后台管理系统</strong>
							<span>NONGYU BACKEND MANAGEMENT SYSTEM</span>
						</div>
					</div>

					<LoginShowcase activeField={activeField} passwordVisible={passwordVisible} hasPassword={hasPassword} />

					<div className="login-left-links">
						<span>隐私政策</span>
						<span>服务条款</span>
						<span>联系我们</span>
					</div>
				</div>

				<div className="login-right">
					<div className="login-right-panel">
						<div className="login-right-header">
							<h1>
								欢迎<span>回来</span>!
							</h1>
							<p>请输入你的登录信息</p>
						</div>

						<div className="login-form-shell">
							<LoginForm
								onFieldFocusChange={setActiveField}
								onPasswordVisibilityChange={setPasswordVisible}
								onPasswordFilledChange={setHasPassword}
							/>
						</div>

						<div className="login-signup">
							<span>还没有账号？</span>
							<button type="button">立即注册</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
