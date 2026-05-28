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

const LayoutColumns = (props: any) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { Header, Sider, Content } = Layout;
	const { isCollapse, menuList = [], menuLoading, themeConfig } = props;
	const menuTheme = themeConfig.isDark ? "dark" : "light";
	const isDark = themeConfig.isDark;
	const brandTitle = isCollapse ? "Agri" : "Agri-Space-Admin";

	const currentTopMenu = useMemo(() => {
		return findTopMenu(menuList, pathname) ?? menuList[0];
	}, [menuList, pathname]);

	const secondaryMenuList = currentTopMenu?.children?.length ? currentTopMenu.children : currentTopMenu ? [currentTopMenu] : [];
	const topMenuItems = useMemo(() => {
		return menuList.map((item: Menu.MenuOptions) => ({
			key: item.path,
			icon: createMenuIcon(item.icon),
			label: item.title
		}));
	}, [menuList]);

	return (
		<section
			className={`container layout-columns ${isDark ? "layout-columns--dark" : ""} ${isCollapse ? "is-collapsed" : ""}`.trim()}
		>
			<Header className="layout-columns__header">
				<div className="layout-columns__header-left">
					<div className="layout-columns__brand">
						<Logo collapsed={false} title={brandTitle}></Logo>
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
							onClick={({ key }) => {
								const nextTopMenu = menuList.find((item: Menu.MenuOptions) => item.path === key);
								if (!nextTopMenu) return;
								navigate(getMenuLeafPath(nextTopMenu));
							}}
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
