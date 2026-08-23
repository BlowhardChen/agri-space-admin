import { Layout } from "antd";
import LayoutMenu from "../components/Menu";
import LayoutMainContent from "../components/MainContent";

/** 组合垂直侧边栏后台布局。 */
const LayoutVertical = (props: any) => {
	// 读取 Ant Design 布局的侧栏组件。
	const { Sider } = Layout;
	// 读取侧栏、菜单加载状态和布局主题配置。
	const { isCollapse, menuList, menuLoading, themeConfig } = props;
	// 根据明暗模式选择菜单主题。
	const menuTheme = themeConfig.isDark ? "dark" : "light";

	// 渲染 `LayoutVertical` 的 JSX 模板。
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
