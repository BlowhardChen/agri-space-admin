import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Logo from "../components/Menu/components/Logo";
import LayoutMenu from "../components/Menu";
import LayoutTabs from "../components/Tabs";
import LayoutFooter from "../components/Footer";
import AssemblySize from "../components/Header/components/AssemblySize";
import Language from "../components/Header/components/Language";
import Theme from "../components/Header/components/Theme";
import Fullscreen from "../components/Header/components/Fullscreen";
import AvatarIcon from "../components/Header/components/AvatarIcon";
import "./index.less";

/** 组合顶部横向菜单后台布局。 */
const LayoutTransverse = (props: any) => {
	// 读取 Ant Design 布局的头部和内容区组件。
	const { Header, Content } = Layout;
	// 读取横向布局所需的菜单、加载状态和主题配置。
	const { menuList, menuLoading, themeConfig } = props;
	// 根据明暗模式选择菜单主题。
	const menuTheme = themeConfig.isDark ? "dark" : "light";
	// 判断当前是否启用深色主题。
	const isDark = themeConfig.isDark;

	// 渲染 `LayoutTransverse` 的 JSX 模板。
	return (
		<section className={`container layout-transverse ${isDark ? "layout-transverse--dark" : ""}`.trim()}>
			<Header className="layout-transverse__header">
				<div className="layout-transverse__header-left">
					<div className="layout-transverse__brand">
						<Logo collapsed={false}></Logo>
					</div>
					<div className="layout-transverse__menu-wrap">
						<LayoutMenu
							menuData={menuList}
							loading={menuLoading}
							mode="horizontal"
							theme={menuTheme}
							showLogo={false}
							className="layout-transverse__menu"
						></LayoutMenu>
					</div>
				</div>
				<div className="layout-transverse__header-right">
					<AssemblySize />
					<Language />
					<Theme />
					<Fullscreen />
					<span className="username">Admin</span>
					<AvatarIcon />
				</div>
			</Header>
			<Layout className="layout-transverse__main">
				<LayoutTabs></LayoutTabs>
				<Content>
					<Outlet></Outlet>
				</Content>
				<LayoutFooter></LayoutFooter>
			</Layout>
		</section>
	);
};

export default LayoutTransverse;
