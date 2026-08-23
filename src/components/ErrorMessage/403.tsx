import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import "./index.less";

/** 渲染无访问权限提示页面。 */
const NotAuth = () => {
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	/** 跳转到系统首页。 */
	const goHome = () => {
		navigate(HOME_URL);
	};
	// 渲染 `NotAuth` 的 JSX 模板。
	return (
		<Result
			status="403"
			title="403"
			subTitle="Sorry, you are not authorized to access this page."
			extra={
				<Button type="primary" onClick={goHome}>
					Back Home
				</Button>
			}
		/>
	);
};

export default NotAuth;
