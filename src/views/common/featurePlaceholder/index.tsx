import { Card, Result, Tag, Typography } from "antd";

interface FeaturePlaceholderProps {
	title: string;
	path: string;
}

/** 为尚未迁移完成的业务功能渲染统一占位页面。 */
const FeaturePlaceholder = ({ title, path }: FeaturePlaceholderProps) => {
	// 渲染业务标题、迁移状态和真实路由路径。
	return (
		<Card bordered={false}>
			{/* 说明当前业务菜单已接入路由，但页面功能仍待迁移。 */}
			<Result
				status="info"
				title={title}
				subTitle="菜单与路由已按原平台业务模块接入，具体页面功能将按模块逐步迁移。"
				extra={
					<Typography.Text type="secondary">
						当前路由：<Tag>{path}</Tag>
					</Typography.Text>
				}
			/>
		</Card>
	);
};

export default FeaturePlaceholder;
