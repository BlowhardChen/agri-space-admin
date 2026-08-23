import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import "./index.less";

/** 渲染路由不存在提示页面。 */
const NotFound = () => {
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	/** 跳转到系统首页。 */
	const goHome = () => {
		navigate(HOME_URL);
	};
	// 渲染 `NotFound` 的 JSX 模板。
	return (
		<Result
			status="404"
			title="404"
			subTitle="Sorry, the page you visited does not exist."
			extra={
				<Button type="primary" onClick={goHome}>
					Back Home
				</Button>
			}
		/>
	);
};

export default NotFound;
