import { useState } from "react";
import LoginForm from "./components/LoginForm";
import AnimatedLoginIllustration from "./components";
import SwitchDark from "@/components/SwitchDark";
import "./index.less";

const Login = () => {
	const [activeField, setActiveField] = useState<"username" | "password" | null>(null);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [hasPassword, setHasPassword] = useState(false);

	return (
		<div className="login-container">
			<SwitchDark />
			<div className="login-box">
				<div className="login-left">
					<div className="login-brand">
						<div className="brand-badge">✦</div>
						<span>农域后台管理系统</span>
					</div>
					<div className="login-left-visual">
						<AnimatedLoginIllustration activeField={activeField} passwordVisible={passwordVisible} hasPassword={hasPassword} />
					</div>
					<div className="login-left-links">
						<span>隐私政策</span>
						<span>服务条款</span>
						<span>联系我们</span>
					</div>
				</div>
				<div className="login-right">
					<div className="login-right-header">
						<h1>欢迎回来！</h1>
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
						<a href="/">立即注册</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
