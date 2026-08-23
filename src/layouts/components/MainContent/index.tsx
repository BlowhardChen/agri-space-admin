import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import LayoutHeader from "../Header";
import LayoutTabs from "../Tabs";
import LayoutFooter from "../Footer";

interface MainContentProps {
	className?: string;
	afterHeader?: ReactNode;
	showCollapse?: boolean;
}

/** 渲染路由内容、标签页和页脚区域。 */
const LayoutMainContent = ({ className = "", afterHeader, showCollapse = true }: MainContentProps) => {
	// 读取 Ant Design 布局的内容区组件。
	const { Content } = Layout;

	// 渲染 `LayoutMainContent` 的 JSX 模板。
	return (
		<Layout className={className}>
			<LayoutHeader showCollapse={showCollapse}></LayoutHeader>
			{afterHeader}
			<LayoutTabs></LayoutTabs>
			<Content>
				<Outlet></Outlet>
			</Content>
			<LayoutFooter></LayoutFooter>
		</Layout>
	);
};

export default LayoutMainContent;
