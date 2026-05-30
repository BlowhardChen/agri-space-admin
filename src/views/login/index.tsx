import { useState } from "react";
import { connect } from "react-redux";
import LoginForm, { type LoginPanelMode } from "./components/LoginForm";
import LoginShowcase from "./components";
import SwitchDark from "@/components/SwitchDark";
import "./index.less";

interface LoginProps {
	themeConfig?: {
		isDark?: boolean;
	};
}

const Login = ({ themeConfig }: LoginProps) => {
	const [panelMode, setPanelMode] = useState<LoginPanelMode>("login");
	const isDark = Boolean(themeConfig?.isDark);
	const isRegisterMode = panelMode === "register";

	return (
		<div className={`login-container ${isDark ? "login-container--dark" : ""}`.trim()}>
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

					<LoginShowcase />

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
								{isRegisterMode ? (
									<>
										创建<span>账号</span>
									</>
								) : (
									<>
										欢迎<span>回来</span>
									</>
								)}
							</h1>
							<p>{isRegisterMode ? "填写基础信息，立即开通后台账号" : "请输入你的登录信息"}</p>
						</div>

						<div className="login-form-shell">
							<LoginForm panelMode={panelMode} onModeChange={setPanelMode} />
						</div>

						<div className="login-signup">
							<span>{isRegisterMode ? "已经有账号？" : "还没有账号？"}</span>
							<button
								type="button"
								onMouseDown={event => event.preventDefault()}
								onClick={() => setPanelMode(isRegisterMode ? "login" : "register")}
							>
								{isRegisterMode ? "返回登录" : "立即注册"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => state.global;

export default connect(mapStateToProps)(Login);
