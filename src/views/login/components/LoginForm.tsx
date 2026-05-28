import md5 from "js-md5";
import { useState } from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { Login } from "@/api/interface";
import { loginApi } from "@/api/modules/login";
import { HOME_URL } from "@/config/config";
import { setToken } from "@/redux/modules/global/action";
import { setTabsList } from "@/redux/modules/tabs/action";

interface LoginFormProps {
	setToken?: (token: string) => void;
	setTabsList?: (tabs: []) => void;
	onFieldFocusChange?: (field: "username" | "password" | null) => void;
	onPasswordVisibilityChange?: (visible: boolean) => void;
	onPasswordFilledChange?: (filled: boolean) => void;
}

const LoginForm = (props: LoginFormProps) => {
	const { setToken, setTabsList, onFieldFocusChange, onPasswordVisibilityChange, onPasswordFilledChange } = props;
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);

	const onFinish = async (loginForm: Login.ReqLoginForm) => {
		try {
			setLoading(true);
			loginForm.password = md5(loginForm.password);
			const { data } = await loginApi(loginForm);
			if (data?.access_token) setToken?.(data.access_token);
			setTabsList?.([]);
			message.success("登录成功！");
			navigate(HOME_URL);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form
			form={form}
			className="login-form"
			name="basic"
			initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={errorInfo => console.log("Failed:", errorInfo)}
			size="large"
			autoComplete="off"
		>
			<div className="login-field-label">用户名</div>
			<Form.Item name="username" rules={[{ required: true, message: "请输入用户名" }]}>
				<Input
					placeholder="请输入用户名"
					prefix={<UserOutlined />}
					onFocus={() => onFieldFocusChange?.("username")}
					onBlur={() => onFieldFocusChange?.(null)}
				/>
			</Form.Item>

			<div className="login-field-label">密码</div>
			<Form.Item name="password" rules={[{ required: true, message: "请输入密码" }]}>
				<Input.Password
					autoComplete="new-password"
					placeholder="请输入密码"
					prefix={<LockOutlined />}
					visibilityToggle={{
						visible: passwordVisible,
						onVisibleChange: visible => {
							setPasswordVisible(visible);
							onPasswordVisibilityChange?.(visible);
						}
					}}
					iconRender={visible => (visible ? <EyeTwoTone twoToneColor="#4a4a4a" /> : <EyeInvisibleOutlined />)}
					onFocus={() => onFieldFocusChange?.("password")}
					onBlur={() => onFieldFocusChange?.(null)}
					onChange={event => onPasswordFilledChange?.(event.target.value.length > 0)}
				/>
			</Form.Item>

			<div className="form-actions">
				<label className="form-check">
					<Checkbox>30 天内记住我</Checkbox>
				</label>
				<button className="form-link form-link-button" type="button">
					忘记密码？
				</button>
			</div>

			<Form.Item className="login-btn">
				<Button type="primary" htmlType="submit" loading={loading}>
					登录
				</Button>
				<Button htmlType="button" icon={<MailOutlined />}>
					使用验证码登录
				</Button>
			</Form.Item>
		</Form>
	);
};

const mapDispatchToProps = { setToken, setTabsList };

export default connect(null, mapDispatchToProps)(LoginForm);
