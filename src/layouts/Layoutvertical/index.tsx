import { Layout } from "antd";
import LayoutMenu from "../components/Menu";
import LayoutMainContent from "../components/MainContent";

const LayoutVertical = (props: any) => {
	const { Sider } = Layout;
	const { isCollapse, menuList, menuLoading, themeConfig } = props;
	const menuTheme = themeConfig.isDark ? "dark" : "light";

	return (
		<section className="container layout-vertical">
			<Sider trigger={null} collapsed={isCollapse} width={220} theme={menuTheme}>
				<LayoutMenu menuData={menuList} loading={menuLoading} collapsed={isCollapse} theme={menuTheme}></LayoutMenu>
			</Sider>
			<LayoutMainContent></LayoutMainContent>
		</section>
	);
};

export default LayoutVertical;
