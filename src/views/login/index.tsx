import { useEffect, useState } from "react";
import { connect } from "react-redux";
import LoginForm, { type LoginPanelMode } from "./components/LoginForm";
import LoginShowcase from "./components";
import SwitchDark from "@/components/SwitchDark";
import { isMockAuthEnabled } from "@/api/modules/login";
import "./index.less";

interface LoginProps {
	themeConfig?: {
		isDark?: boolean;
	};
}

type FocusField = "username" | "password" | "phone" | "captcha" | null;

/** 组合登录表单与品牌展示区域。 */
const Login = ({ themeConfig }: LoginProps) => {
	// 维护登录与注册面板模式。
	const [panelMode, setPanelMode] = useState<LoginPanelMode>("login");
	// 维护当前聚焦的登录字段。
	const [activeField, setActiveField] = useState<FocusField>(null);
	// 维护密码输入框的可见状态。
	const [passwordVisible, setPasswordVisible] = useState(false);
	// 维护当前密码字段是否已有内容。
	const [hasPassword, setHasPassword] = useState(false);
	// 判断当前是否启用深色主题。
	const isDark = Boolean(themeConfig?.isDark);
	// 判断登录面板当前是否处于注册模式。
	const isRegisterMode = panelMode === "register";

	useEffect(
		/* 在依赖变化时同步组件副作用，并在必要时执行清理。 */ () => {
			setActiveField(null);
			setPasswordVisible(false);
			setHasPassword(false);
		},
		[panelMode]
	);

	// 渲染 `Login` 的 JSX 模板。
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
							<LoginForm
								panelMode={panelMode}
								onModeChange={setPanelMode}
								onFieldFocusChange={setActiveField}
								onPasswordVisibilityChange={setPasswordVisible}
								onPasswordFilledChange={setHasPassword}
							/>
						</div>

						{isMockAuthEnabled && (
							<div className="login-signup">
								<span>{isRegisterMode ? "已经有账号？" : "还没有账号？"}</span>
								<button
									type="button"
									onMouseDown={/* 阻止按钮按下时触发表单默认行为。 */ event => event.preventDefault()}
									onClick={/* 切换登录与注册面板。 */ () => setPanelMode(isRegisterMode ? "login" : "register")}
								>
									{isRegisterMode ? "返回登录" : "立即注册"}
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;

export default connect(mapStateToProps)(Login);
