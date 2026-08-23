import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Layout, Menu, Spin } from "antd";
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
import { createMenuIcon, findTopMenu, getMenuLeafPath } from "../utils";
import "./index.less";

/** 组合双列菜单后台布局。 */
const LayoutColumns = (props: any) => {
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	// 读取 Ant Design 布局的头部、侧栏和内容区组件。
	const { Header, Sider, Content } = Layout;
	// 读取侧栏、菜单加载状态和布局主题配置。
	const { isCollapse, menuList = [], menuLoading, themeConfig } = props;
	// 根据明暗模式选择菜单主题。
	const menuTheme = themeConfig.isDark ? "dark" : "light";
	// 判断当前是否启用深色主题。
	const isDark = themeConfig.isDark;

	// 定位当前路由所属的一级菜单。
	const currentTopMenu = useMemo(
		/* 根据依赖重新计算并缓存派生数据。 */ () => {
			return findTopMenu(menuList, pathname) ?? menuList[0];
		},
		[menuList, pathname]
	);

	// 计算当前一级菜单对应的二级菜单列表。
	const secondaryMenuList = currentTopMenu?.children?.length ? currentTopMenu.children : currentTopMenu ? [currentTopMenu] : [];
	// 将一级菜单转换为横向导航项。
	const topMenuItems = useMemo(
		/* 根据依赖重新计算并缓存派生数据。 */ () => {
			return menuList.map(
				/* 根据当前集合项生成对应的模板或数据。 */ (item: Menu.MenuOptions) => ({
					key: item.path,
					icon: createMenuIcon(item.icon),
					label: item.title
				})
			);
		},
		[menuList]
	);

	// 渲染 `LayoutColumns` 的 JSX 模板。
	return (
		<section
			className={`container layout-columns ${isDark ? "layout-columns--dark" : ""} ${isCollapse ? "is-collapsed" : ""}`.trim()}
		>
			<Header className="layout-columns__header">
				<div className="layout-columns__header-left">
					<div className="layout-columns__brand">
						<Logo collapsed={false}></Logo>
						<CollapseIcon />
					</div>
				</div>
				<div className="layout-columns__header-right">
					<AssemblySize />
					<Language />
					<Theme />
					<Fullscreen />
					<span className="username">Admin</span>
					<AvatarIcon />
				</div>
			</Header>

			<section className="layout-columns__body">
				<Sider width={96} theme={menuTheme} className="layout-columns__primary-sider">
					<Spin spinning={menuLoading} tip="Loading...">
						<Menu
							mode="inline"
							theme={menuTheme}
							className="layout-columns__top-menu"
							selectedKeys={currentTopMenu ? [currentTopMenu.path] : []}
							items={topMenuItems}
							onClick={
								/* 跳转到用户选择的页面。 */ ({ key }) => {
									// 选择初始化时需要激活的一级菜单。
									const nextTopMenu = menuList.find(
										/* 判断当前集合项是否为目标数据。 */ (item: Menu.MenuOptions) => item.path === key
									);
									if (!nextTopMenu) return;
									navigate(getMenuLeafPath(nextTopMenu));
								}
							}
						></Menu>
					</Spin>
				</Sider>

				<Sider
					trigger={null}
					width={220}
					collapsedWidth={0}
					collapsed={isCollapse}
					theme={menuTheme}
					className="layout-columns__secondary-sider"
				>
					<div className="layout-columns__submenu-title">{currentTopMenu?.title ?? "导航菜单"}</div>
					<LayoutMenu
						menuData={secondaryMenuList}
						loading={menuLoading}
						collapsed={false}
						showLogo={false}
						theme={menuTheme}
						className="layout-columns__submenu"
					></LayoutMenu>
				</Sider>

				<Layout className="layout-columns__main">
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

export default LayoutColumns;
