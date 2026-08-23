import { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import {
	EyeInvisibleOutlined,
	EyeTwoTone,
	LockOutlined,
	MailOutlined,
	MobileOutlined,
	SafetyCertificateOutlined,
	UserOutlined
} from "@ant-design/icons";
import { connect } from "react-redux";
import { Login } from "@/api/interface";
import { loginApi, registerApi } from "@/api/modules/login";
import { HOME_URL } from "@/config/config";
import { resetSession, setToken } from "@/redux/modules/global/action";

export type LoginPanelMode = "login" | "register";
type LoginMode = "password" | "captcha";
type FocusField = "username" | "password" | "phone" | "captcha" | null;

interface PasswordLoginForm {
	username: string;
	password: string;
	remember?: boolean;
}

interface CaptchaLoginForm {
	phone: string;
	captcha: string;
	remember?: boolean;
}

interface RegisterFormValues {
	registerUsername: string;
	registerPassword: string;
	confirmPassword: string;
	agree?: boolean;
}

interface LoginFormProps {
	panelMode: LoginPanelMode;
	setToken?: (token: string) => void;
	resetSession?: () => void;
	onFieldFocusChange?: (field: FocusField) => void;
	onPasswordVisibilityChange?: (visible: boolean) => void;
	onPasswordFilledChange?: (filled: boolean) => void;
	onModeChange?: (mode: LoginPanelMode) => void;
}

type LoginFormValues = PasswordLoginForm & CaptchaLoginForm & RegisterFormValues;

/** 定义验证码再次发送前的倒计时秒数。 */
const CAPTCHA_SECONDS = 60;
/** 定义本地验证码登录使用的演示验证码。 */
const DEMO_CAPTCHA = "246810";
/** 定义演示验证码登录账号。 */
const DEMO_CAPTCHA_LOGIN: Login.ReqLoginForm = {
	username: "admin",
	password: "123456"
};

/** 定义手机号字段的校验规则。 */
const phoneRule = [
	{ required: true, message: "请输入手机号" },
	{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" }
];

/** 定义验证码字段的校验规则。 */
const captchaRule = [
	{ required: true, message: "请输入验证码" },
	{ len: 6, message: "请输入 6 位验证码" }
];

/** 渲染密码、验证码登录和注册表单并提交认证请求。 */
const LoginForm = (props: LoginFormProps) => {
	// 读取认证表单模式、会话操作和角色动画通知函数。
	const {
		panelMode,
		setToken,
		resetSession,
		onFieldFocusChange,
		onPasswordVisibilityChange,
		onPasswordFilledChange,
		onModeChange
	} = props;
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	// 创建登录与注册共用的 Ant Design 表单实例。
	const [form] = Form.useForm<LoginFormValues>();
	// 维护当前异步操作的加载状态。
	const [loading, setLoading] = useState(false);
	// 维护密码输入框的可见状态。
	const [passwordVisible, setPasswordVisible] = useState(false);
	// 维护注册密码输入框的可见状态。
	const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
	// 维护确认密码输入框的可见状态。
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	// 维护密码与验证码登录模式。
	const [loginMode, setLoginMode] = useState<LoginMode>("password");
	// 维护验证码再次发送前的剩余秒数。
	const [countdown, setCountdown] = useState(0);

	useEffect(
		/* 安排延迟状态更新，并在依赖变化时清理定时器。 */ () => {
			setPasswordVisible(false);
			setRegisterPasswordVisible(false);
			setConfirmPasswordVisible(false);
			setCountdown(0);
			onFieldFocusChange?.(null);
			onPasswordVisibilityChange?.(false);
			onPasswordFilledChange?.(false);
		},
		[panelMode]
	);

	useEffect(
		/* 安排延迟状态更新，并在依赖变化时清理定时器。 */ () => {
			if (!countdown) return;
			// 记录当前定时器，便于副作用清理。
			const timer = window.setTimeout(
				/* 延迟执行角色动画或状态更新。 */ () => setCountdown(/* 基于上一次倒计时计算剩余秒数。 */ prev => prev - 1),
				1000
			);
			return /* 在副作用清理阶段取消定时器。 */ () => window.clearTimeout(timer);
		},
		[countdown]
	);

	/** 保存访问令牌、重置会话状态并跳转首页。 */
	const completeLogin = (token?: string) => {
		if (!token) throw new Error("登录响应中缺少访问令牌");
		resetSession?.();
		setToken?.(token);
		message.success("登录成功！");
		navigate(HOME_URL);
	};

	/** 提交账号密码并完成登录。 */
	const handlePasswordLogin = async (loginForm: PasswordLoginForm) => {
		// 读取 Redux action 携带的状态载荷。
		const payload: Login.ReqLoginForm = {
			username: loginForm.username,
			password: loginForm.password
		};
		// 读取接口响应中的业务数据。
		const { data } = await loginApi(payload);
		completeLogin(data?.access_token);
	};

	/** 校验演示验证码并完成登录。 */
	const handleCaptchaLogin = async (loginForm: CaptchaLoginForm) => {
		if (loginForm.captcha !== DEMO_CAPTCHA) {
			message.error(`验证码错误，请输入 ${DEMO_CAPTCHA}`);
			return;
		}
		// 读取接口响应中的业务数据。
		const { data } = await loginApi({
			username: DEMO_CAPTCHA_LOGIN.username,
			password: DEMO_CAPTCHA_LOGIN.password
		});
		completeLogin(data?.access_token);
	};

	/** 提交注册信息并切换回密码登录。 */
	const handleRegister = async (registerForm: RegisterFormValues) => {
		// 读取并清理表单中的用户名。
		const username = registerForm.registerUsername.trim();
		await registerApi({
			username,
			phone: username,
			password: registerForm.registerPassword
		});
		message.success("注册成功，请使用新账号登录");
		form.setFieldsValue({
			username,
			password: undefined,
			registerPassword: undefined,
			confirmPassword: undefined,
			captcha: undefined
		});
		onModeChange?.("login");
		setLoginMode("password");
	};

	/** 根据当前面板模式提交登录或注册表单。 */
	const onFinish = async (values: LoginFormValues) => {
		try {
			setLoading(true);
			if (panelMode === "register") {
				await handleRegister(values);
				return;
			}
			if (loginMode === "password") {
				await handlePasswordLogin(values);
			} else {
				await handleCaptchaLogin(values);
			}
		} catch (error: any) {
			// error 表示认证或注册请求返回的业务异常。
			message.error(error?.msg ?? error?.message ?? "操作失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	/** 切换密码登录与验证码登录模式。 */
	const switchMode = () => {
		// 计算表单提交后需要切换的登录模式。
		const nextMode: LoginMode = loginMode === "password" ? "captcha" : "password";
		setLoginMode(nextMode);
		setPasswordVisible(false);
		setCountdown(0);
		onFieldFocusChange?.(null);
		onPasswordVisibilityChange?.(false);
		onPasswordFilledChange?.(false);
		form.resetFields(["password", "captcha"]);
	};

	/** 校验手机号并启动验证码倒计时。 */
	const sendCaptcha = async () => {
		try {
			// 读取并清理表单中的手机号。
			const phone = form.getFieldValue("phone");
			await form.validateFields(["phone"]);
			setCountdown(CAPTCHA_SECONDS);
			message.success(`验证码已发送至 ${phone}，演示验证码：${DEMO_CAPTCHA}`);
		} catch {
			// antd has already displayed the validation feedback
		}
	};

	// 渲染 `LoginForm` 的 JSX 模板。
	return (
		<Form
			form={form}
			className={`login-form login-form--${panelMode} ${panelMode === "login" ? `login-form--${loginMode}` : ""}`.trim()}
			name={panelMode}
			initialValues={{ remember: true, agree: true }}
			onFinish={onFinish}
			size="large"
			autoComplete="off"
		>
			{panelMode === "login" ? (
				<>
					{/* 根据登录方式展示账号密码或手机验证码字段。 */}
					{loginMode === "password" ? (
						<>
							<div className="login-field-label">用户名</div>
							<Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
								<Input
									autoComplete="username"
									placeholder="请输入用户名"
									prefix={<UserOutlined />}
									onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("username")}
									onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
								/>
							</Form.Item>

							<div className="login-field-label">密码</div>
							<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
								<Input.Password
									autoComplete="current-password"
									placeholder="请输入密码"
									prefix={<LockOutlined />}
									visibilityToggle={{
										visible: passwordVisible,
										onVisibleChange: /* 同步密码可见状态并通知展示区动画。 */ visible => {
											setPasswordVisible(visible);
											onPasswordVisibilityChange?.(visible);
										}
									}}
									iconRender={
										/* 根据密码可见状态渲染对应图标。 */ visible =>
											visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />
									}
									onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("password")}
									onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
									onChange={
										/* 同步密码是否已输入以驱动角色动画。 */ event => onPasswordFilledChange?.(event.target.value.length > 0)
									}
								/>
							</Form.Item>
						</>
					) : (
						<>
							<div className="login-field-label">手机号</div>
							<Form.Item name="phone" rules={phoneRule}>
								<Input
									autoComplete="tel"
									maxLength={11}
									placeholder="请输入手机号"
									prefix={<MobileOutlined />}
									onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("phone")}
									onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
								/>
							</Form.Item>

							<div className="login-field-label">验证码</div>
							<Form.Item name="captcha" rules={captchaRule}>
								<Input
									autoComplete="one-time-code"
									maxLength={6}
									placeholder="请输入验证码"
									prefix={<MailOutlined />}
									suffix={
										<button
											type="button"
											className={`captcha-send-btn ${countdown ? "is-disabled" : ""}`}
											onClick={sendCaptcha}
											disabled={Boolean(countdown)}
										>
											{countdown ? `${countdown}s 后重试` : "获取验证码"}
										</button>
									}
									onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("captcha")}
									onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
									onChange={
										/* 同步密码是否已输入以驱动角色动画。 */ event => onPasswordFilledChange?.(event.target.value.length > 0)
									}
								/>
							</Form.Item>
							<div className="login-mode-tip">演示说明：验证码登录默认映射到管理员账号，当前验证码为 {DEMO_CAPTCHA}。</div>
						</>
					)}

					{/* 提供记住登录状态、辅助入口和登录方式切换操作。 */}
					<div className="form-actions">
						<div className="form-check">
							<Checkbox>{"30 天内记住我"}</Checkbox>
						</div>
						<button className="form-link form-link-button" type="button">
							{loginMode === "password" ? "忘记密码?" : "收不到验证码?"}
						</button>
					</div>

					<Form.Item className="login-btn">
						<Button type="primary" htmlType="submit" loading={loading}>
							{loginMode === "password" ? "登录" : "验证码登录"}
						</Button>
						<Button
							htmlType="button"
							icon={loginMode === "password" ? <MailOutlined /> : <LockOutlined />}
							onMouseDown={/* 阻止按钮按下时触发表单默认行为。 */ event => event.preventDefault()}
							onClick={switchMode}
						>
							{loginMode === "password" ? "使用验证码登录" : "使用密码登录"}
						</Button>
					</Form.Item>
				</>
			) : (
				<>
					{/* 注册账号、密码和确认密码字段。 */}
					<div className="login-field-label">用户名</div>
					<Form.Item name="registerUsername" rules={phoneRule}>
						<Input
							autoComplete="tel"
							maxLength={11}
							placeholder="请输入手机号"
							prefix={<MobileOutlined />}
							onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("username")}
							onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
						/>
					</Form.Item>

					<div className="login-field-label">密码</div>
					<Form.Item
						name="registerPassword"
						rules={[
							{ required: true, message: "请输入密码" },
							{ min: 6, message: "密码至少 6 位" }
						]}
					>
						<Input.Password
							autoComplete="new-password"
							placeholder="请设置登录密码"
							prefix={<LockOutlined />}
							visibilityToggle={{
								visible: registerPasswordVisible,
								onVisibleChange: /* 同步注册密码可见状态并通知展示区动画。 */ visible => {
									setRegisterPasswordVisible(visible);
									onPasswordVisibilityChange?.(visible);
								}
							}}
							iconRender={
								/* 根据注册密码可见状态渲染对应图标。 */ visible =>
									visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />
							}
							onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("password")}
							onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
							onChange={/* 同步密码是否已输入以驱动角色动画。 */ event => onPasswordFilledChange?.(event.target.value.length > 0)}
						/>
					</Form.Item>

					<div className="login-field-label">确认密码</div>
					<Form.Item
						name="confirmPassword"
						dependencies={["registerPassword"]}
						rules={[
							{ required: true, message: "请再次输入密码" },
							/* 基于当前表单值创建确认密码校验规则。 */ ({ getFieldValue }) => ({
								/** 校验两次输入的密码是否一致。 */
								validator(_, value) {
									if (!value || getFieldValue("registerPassword") === value) {
										return Promise.resolve();
									}
									return Promise.reject(new Error("两次输入的密码不一致"));
								}
							})
						]}
					>
						<Input.Password
							autoComplete="new-password"
							placeholder="请再次输入密码"
							prefix={<SafetyCertificateOutlined />}
							visibilityToggle={{
								visible: confirmPasswordVisible,
								onVisibleChange: /* 同步确认密码可见状态并通知展示区动画。 */ visible => {
									setConfirmPasswordVisible(visible);
									onPasswordVisibilityChange?.(visible);
								}
							}}
							iconRender={
								/* 根据确认密码可见状态渲染对应图标。 */ visible =>
									visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />
							}
							onFocus={/* 同步当前聚焦的表单字段。 */ () => onFieldFocusChange?.("password")}
							onBlur={/* 在输入框失焦时清除活动字段。 */ () => onFieldFocusChange?.(null)}
							onChange={/* 同步密码是否已输入以驱动角色动画。 */ event => onPasswordFilledChange?.(event.target.value.length > 0)}
						/>
					</Form.Item>

					<div className="form-actions form-actions--single">
						<div className="form-check">
							<Form.Item
								name="agree"
								valuePropName="checked"
								className="form-agreement"
								rules={[
									{
										validator: /* 确认用户已经阅读并同意服务条款。 */ (_, value) =>
											value ? Promise.resolve() : Promise.reject(new Error("请先阅读并同意服务条款"))
									}
								]}
							>
								<Checkbox>我已阅读并同意服务条款</Checkbox>
							</Form.Item>
						</div>
					</div>

					<Form.Item className="login-btn">
						<Button type="primary" htmlType="submit" loading={loading}>
							立即注册
						</Button>
						<Button
							htmlType="button"
							icon={<LockOutlined />}
							onMouseDown={/* 阻止按钮按下时触发表单默认行为。 */ event => event.preventDefault()}
							onClick={/* 切换回密码登录面板。 */ () => onModeChange?.("login")}
						>
							返回登录
						</Button>
					</Form.Item>
				</>
			)}
		</Form>
	);
};

/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setToken, resetSession };

export default connect(null, mapDispatchToProps)(LoginForm);
