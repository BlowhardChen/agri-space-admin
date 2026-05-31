import md5 from "js-md5";
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
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";

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
	setTabsList?: (tabs: []) => void;
	onFieldFocusChange?: (field: FocusField) => void;
	onPasswordVisibilityChange?: (visible: boolean) => void;
	onPasswordFilledChange?: (filled: boolean) => void;
	onModeChange?: (mode: LoginPanelMode) => void;
}

type LoginFormValues = PasswordLoginForm & CaptchaLoginForm & RegisterFormValues;

const CAPTCHA_SECONDS = 60;
const DEMO_CAPTCHA = "246810";
const DEMO_CAPTCHA_LOGIN: Login.ReqLoginForm = {
	username: "admin",
	password: "123456"
};

const phoneRule = [
	{ required: true, message: "请输入手机号" },
	{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" }
];

const captchaRule = [
	{ required: true, message: "请输入验证码" },
	{ len: 6, message: "请输入 6 位验证码" }
];

const LoginForm = (props: LoginFormProps) => {
	const {
		panelMode,
		setToken,
		setTabsList,
		onFieldFocusChange,
		onPasswordVisibilityChange,
		onPasswordFilledChange,
		onModeChange
	} = props;
	const navigate = useNavigate();
	const [form] = Form.useForm<LoginFormValues>();
	const [loading, setLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
	const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
	const [loginMode, setLoginMode] = useState<LoginMode>("password");
	const [countdown, setCountdown] = useState(0);

	useEffect(() => {
		setPasswordVisible(false);
		setRegisterPasswordVisible(false);
		setConfirmPasswordVisible(false);
		setCountdown(0);
		onFieldFocusChange?.(null);
		onPasswordVisibilityChange?.(false);
		onPasswordFilledChange?.(false);
	}, [panelMode]);

	useEffect(() => {
		if (!countdown) return;
		const timer = window.setTimeout(() => setCountdown(prev => prev - 1), 1000);
		return () => window.clearTimeout(timer);
	}, [countdown]);

	const completeLogin = (token?: string) => {
		if (token) setToken?.(token);
		setTabsList?.([]);
		message.success("登录成功！");
		navigate(HOME_URL);
	};

	const handlePasswordLogin = async (loginForm: PasswordLoginForm) => {
		const payload: Login.ReqLoginForm = {
			username: loginForm.username,
			password: md5(loginForm.password)
		};
		const { data } = await loginApi(payload);
		completeLogin(data?.access_token);
	};

	const handleCaptchaLogin = async (loginForm: CaptchaLoginForm) => {
		if (loginForm.captcha !== DEMO_CAPTCHA) {
			message.error(`验证码错误，请输入 ${DEMO_CAPTCHA}`);
			return;
		}
		const { data } = await loginApi({
			username: DEMO_CAPTCHA_LOGIN.username,
			password: md5(DEMO_CAPTCHA_LOGIN.password)
		});
		completeLogin(data?.access_token);
	};

	const handleRegister = async (registerForm: RegisterFormValues) => {
		const username = registerForm.registerUsername.trim();
		await registerApi({
			username,
			phone: username,
			password: md5(registerForm.registerPassword)
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
			message.error(error?.msg ?? "操作失败，请稍后重试");
		} finally {
			setLoading(false);
		}
	};

	const switchMode = () => {
		const nextMode: LoginMode = loginMode === "password" ? "captcha" : "password";
		setLoginMode(nextMode);
		setPasswordVisible(false);
		setCountdown(0);
		onFieldFocusChange?.(null);
		onPasswordVisibilityChange?.(false);
		onPasswordFilledChange?.(false);
		form.resetFields(["password", "captcha"]);
	};

	const sendCaptcha = async () => {
		try {
			const phone = form.getFieldValue("phone");
			await form.validateFields(["phone"]);
			setCountdown(CAPTCHA_SECONDS);
			message.success(`验证码已发送至 ${phone}，演示验证码：${DEMO_CAPTCHA}`);
		} catch {
			// antd has already displayed the validation feedback
		}
	};

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
					{loginMode === "password" ? (
						<>
							<div className="login-field-label">用户名</div>
							<Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
								<Input
									autoComplete="username"
									placeholder="请输入用户名"
									prefix={<UserOutlined />}
									onFocus={() => onFieldFocusChange?.("username")}
									onBlur={() => onFieldFocusChange?.(null)}
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
										onVisibleChange: visible => {
											setPasswordVisible(visible);
											onPasswordVisibilityChange?.(visible);
										}
									}}
									iconRender={visible => (visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />)}
									onFocus={() => onFieldFocusChange?.("password")}
									onBlur={() => onFieldFocusChange?.(null)}
									onChange={event => onPasswordFilledChange?.(event.target.value.length > 0)}
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
									onFocus={() => onFieldFocusChange?.("phone")}
									onBlur={() => onFieldFocusChange?.(null)}
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
									onFocus={() => onFieldFocusChange?.("captcha")}
									onBlur={() => onFieldFocusChange?.(null)}
									onChange={event => onPasswordFilledChange?.(event.target.value.length > 0)}
								/>
							</Form.Item>
							<div className="login-mode-tip">演示说明：验证码登录默认映射到管理员账号，当前验证码为 {DEMO_CAPTCHA}。</div>
						</>
					)}

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
							onMouseDown={event => event.preventDefault()}
							onClick={switchMode}
						>
							{loginMode === "password" ? "使用验证码登录" : "使用密码登录"}
						</Button>
					</Form.Item>
				</>
			) : (
				<>
					<div className="login-field-label">用户名</div>
					<Form.Item name="registerUsername" rules={phoneRule}>
						<Input
							autoComplete="tel"
							maxLength={11}
							placeholder="请输入手机号"
							prefix={<MobileOutlined />}
							onFocus={() => onFieldFocusChange?.("username")}
							onBlur={() => onFieldFocusChange?.(null)}
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
								onVisibleChange: visible => {
									setRegisterPasswordVisible(visible);
									onPasswordVisibilityChange?.(visible);
								}
							}}
							iconRender={visible => (visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />)}
							onFocus={() => onFieldFocusChange?.("password")}
							onBlur={() => onFieldFocusChange?.(null)}
							onChange={event => onPasswordFilledChange?.(event.target.value.length > 0)}
						/>
					</Form.Item>

					<div className="login-field-label">确认密码</div>
					<Form.Item
						name="confirmPassword"
						dependencies={["registerPassword"]}
						rules={[
							{ required: true, message: "请再次输入密码" },
							({ getFieldValue }) => ({
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
								onVisibleChange: visible => {
									setConfirmPasswordVisible(visible);
									onPasswordVisibilityChange?.(visible);
								}
							}}
							iconRender={visible => (visible ? <EyeTwoTone twoToneColor="#379446" /> : <EyeInvisibleOutlined />)}
							onFocus={() => onFieldFocusChange?.("password")}
							onBlur={() => onFieldFocusChange?.(null)}
							onChange={event => onPasswordFilledChange?.(event.target.value.length > 0)}
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
										validator: (_, value) => (value ? Promise.resolve() : Promise.reject(new Error("请先阅读并同意服务条款")))
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
							onMouseDown={event => event.preventDefault()}
							onClick={() => onModeChange?.("login")}
						>
							返回登录
						</Button>
					</Form.Item>
				</>
			)}
		</Form>
	);
};

const mapDispatchToProps = { setToken, setTabsList };

export default connect(null, mapDispatchToProps)(LoginForm);
