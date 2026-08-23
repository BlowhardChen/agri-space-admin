import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/config/config";
import "./index.less";

/** 渲染服务异常提示页面。 */
const NotNetwork = () => {
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	/** 跳转到系统首页。 */
	const goHome = () => {
		navigate(HOME_URL);
	};
	// 渲染 `NotNetwork` 的 JSX 模板。
	return (
		<Result
			status="500"
			title="500"
			subTitle="Sorry, something went wrong."
			extra={
				<Button type="primary" onClick={goHome}>
					Back Home
				</Button>
			}
		/>
	);
};

export default NotNetwork;
