import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Logo from "../components/Menu/components/Logo";
import LayoutMenu from "../components/Menu";
import LayoutTabs from "../components/Tabs";
import LayoutFooter from "../components/Footer";
import CollapseIcon from "../components/Header/components/CollapseIcon";
import AssemblySize from "../components/Header/components/AssemblySize";
import Language from "../components/Header/components/Language";
import Theme from "../components/Header/components/Theme";
import Fullscreen from "../components/Header/components/Fullscreen";
import AvatarIcon from "../components/Header/components/AvatarIcon";
import "./index.less";

/** 组合经典侧边栏后台布局。 */
const LayoutClassic = (props: any) => {
	// 读取 Ant Design 布局的头部、侧栏和内容区组件。
	const { Header, Sider, Content } = Layout;
	// 读取侧栏、菜单加载状态和布局主题配置。
	const { isCollapse, menuList, menuLoading, themeConfig } = props;
	// 根据明暗模式选择菜单主题。
	const menuTheme = themeConfig.isDark ? "dark" : "light";
	// 判断当前是否启用深色主题。
	const isDark = themeConfig.isDark;

	// 渲染 `LayoutClassic` 的 JSX 模板。
	return (
		<section className={`container layout-classic ${isDark ? "layout-classic--dark" : ""}`.trim()}>
			<Header className="layout-classic__header">
				<div className="layout-classic__header-left">
					<div className="layout-classic__brand">
						<Logo collapsed={false}></Logo>
					</div>
					<div className="layout-classic__collapse">
						<CollapseIcon />
					</div>
				</div>
				<div className="layout-classic__header-right">
					<AssemblySize />
					<Language />
					<Theme />
					<Fullscreen />
					<span className="username">Admin</span>
					<AvatarIcon />
				</div>
			</Header>
			<section className="layout-classic__body">
				<Sider trigger={null} collapsed={isCollapse} width={220} theme={menuTheme} className="layout-classic__sider">
					<LayoutMenu
						menuData={menuList}
						loading={menuLoading}
						collapsed={isCollapse}
						theme={menuTheme}
						showLogo={false}
						className="layout-classic__menu"
					></LayoutMenu>
				</Sider>
				<Layout className="layout-classic__main">
					<LayoutTabs></LayoutTabs>
					<Content>
						<Outlet></Outlet>
					</Content>
					<LayoutFooter></LayoutFooter>
				</Layout>
			</section>
		</section>
	);
};

export default LayoutClassic;
