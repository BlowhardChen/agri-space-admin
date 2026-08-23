import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Spin } from "antd";
import { searchRoute } from "@/utils/util";
import { connect } from "react-redux";
import type { MenuProps } from "antd";
import Logo from "./components/Logo";
import { findMenuPathChain, getAntdMenuList } from "@/layouts/utils";
import "./index.less";

/** 渲染权限菜单并维护选中与展开状态。 */
const LayoutMenu = (props: any) => {
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 获取 React Router 路由跳转函数。
	const navigate = useNavigate();
	// 读取菜单渲染配置、状态和可选点击回调。
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
	// 保存当前布局实际展示的菜单列表。
	const menuList = props.menuData ?? storeMenuList;
	// 维护当前菜单选中项。
	const [selectedKeys, setSelectedKeys] = useState<string[]>(customSelectedKeys ?? [pathname]);
	// 维护侧边菜单展开项。
	const [openKeys, setOpenKeys] = useState<string[]>([]);

	useEffect(
		/* 在依赖变化时同步组件副作用，并在必要时执行清理。 */ () => {
			setSelectedKeys(customSelectedKeys ?? [pathname]);
			if (mode !== "inline") return;
			if (collapsed) return setOpenKeys([]);
			// 定位与当前路由匹配的菜单路径。
			const currentMenuPath = findMenuPathChain(menuList, pathname);
			setOpenKeys(currentMenuPath.slice(0, -1).map(/* 根据当前集合项生成对应的模板或数据。 */ item => item.path));
		},
		[pathname, collapsed, customSelectedKeys, menuList, mode]
	);

	/** 根据用户操作维护菜单展开项。 */
	const onOpenChange = (keys: string[]) => {
		if (keys.length === 0 || keys.length === 1) return setOpenKeys(keys);
		// 读取本次菜单操作新增的展开项。
		const latestOpenKey = keys[keys.length - 1];
		if (latestOpenKey.includes(keys[0])) return setOpenKeys(keys);
		setOpenKeys([latestOpenKey]);
	};

	// 将权限菜单转换为 Ant Design 菜单项。
	const menuItems = useMemo(/* 根据依赖重新计算并缓存派生数据。 */ () => getAntdMenuList(menuList), [menuList]);

	/** 根据菜单路径完成页面跳转。 */
	const clickMenu: MenuProps["onClick"] = ({ key }: { key: string }) => {
		// 查找与当前路径匹配的路由配置。
		const route = searchRoute(key, menuList);
		if (route.isLink) return window.open(route.isLink, "_blank");
		if (onMenuClick) return onMenuClick(route.path ? route : { path: key, title: key });
		navigate(key);
	};

	// 渲染 `LayoutMenu` 的 JSX 模板。
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

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.menu;
export default connect(mapStateToProps)(LayoutMenu) as any;
