import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

/** 渲染路由不存在提示页面。 */
const NotFound: React.FC = () => {
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();

	/** 返回系统首页。 */
	const handleBackHome = () => {
		navigate("/");
	};

	// 渲染 `NotFound` 的 JSX 模板。
	return (
		<Result
			status="404"
			title="404"
			subTitle="抱歉，您访问的页面不存在。"
			extra={
				<Button type="primary" onClick={handleBackHome}>
					返回首页
				</Button>
			}
		/>
	);
};

export default NotFound;
