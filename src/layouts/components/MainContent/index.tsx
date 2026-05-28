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

const LayoutMainContent = ({ className = "", afterHeader, showCollapse = true }: MainContentProps) => {
	const { Content } = Layout;

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
