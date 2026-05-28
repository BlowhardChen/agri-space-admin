import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Spin } from "antd";
import { searchRoute } from "@/utils/util";
import { connect } from "react-redux";
import type { MenuProps } from "antd";
import Logo from "./components/Logo";
import { findMenuPathChain, getAntdMenuList } from "@/layouts/utils";
import "./index.less";

const LayoutMenu = (props: any) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const {
		isCollapse,
		menuList: storeMenuList,
		mode = "inline",
		theme = "light",
		showLogo = true,
		className = "",
		collapsed = isCollapse,
		loading = false,
		selectedKeys: customSelectedKeys,
		onMenuClick
	} = props;
	const menuList = props.menuData ?? storeMenuList;
	const [selectedKeys, setSelectedKeys] = useState<string[]>(customSelectedKeys ?? [pathname]);
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	useEffect(() => {
		setSelectedKeys(customSelectedKeys ?? [pathname]);
		if (mode !== "inline") return;
		if (collapsed) return setOpenKeys([]);
		const currentMenuPath = findMenuPathChain(menuList, pathname);
		setOpenKeys(currentMenuPath.slice(0, -1).map(item => item.path));
	}, [pathname, collapsed, customSelectedKeys, menuList, mode]);

	const onOpenChange = (keys: string[]) => {
		if (keys.length === 0 || keys.length === 1) return setOpenKeys(keys);
		const latestOpenKey = keys[keys.length - 1];
		if (latestOpenKey.includes(keys[0])) return setOpenKeys(keys);
		setOpenKeys([latestOpenKey]);
	};

	const menuItems = useMemo(() => getAntdMenuList(menuList), [menuList]);

	const clickMenu: MenuProps["onClick"] = ({ key }: { key: string }) => {
		const route = searchRoute(key, menuList);
		if (route.isLink) return window.open(route.isLink, "_blank");
		if (onMenuClick) return onMenuClick(route.path ? route : { path: key, title: key });
		navigate(key);
	};

	return (
		<div className={`menu ${mode === "horizontal" ? "menu--horizontal" : ""} ${className}`.trim()}>
			<Spin spinning={loading} tip="Loading...">
				{showLogo ? <Logo collapsed={collapsed}></Logo> : null}
				<Menu
					theme={theme}
					mode={mode}
					triggerSubMenuAction="click"
					openKeys={mode === "inline" ? openKeys : undefined}
					selectedKeys={selectedKeys}
					inlineCollapsed={mode === "inline" ? collapsed : undefined}
					items={menuItems}
					onClick={clickMenu}
					onOpenChange={mode === "inline" ? onOpenChange : undefined}
				></Menu>
			</Spin>
		</div>
	);
};

const mapStateToProps = (state: any) => state.menu;
export default connect(mapStateToProps)(LayoutMenu) as any;
