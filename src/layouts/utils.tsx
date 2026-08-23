import React from "react";
import type { MenuProps } from "antd";
import * as Icons from "@ant-design/icons";

export type LayoutMode = "vertical" | "classic" | "transverse" | "columns";
export type MenuItem = Required<MenuProps>["items"][number];

/** 建立自定义菜单图标名称与组件的映射。 */
const customIcons = Icons as unknown as Record<string, React.ComponentType>;

/** 将菜单图标配置转换为 React 图标节点。 */
export const createMenuIcon = (name?: string) => {
	if (!name) return null;
	// 保存菜单配置对应的图标组件。
	const IconComponent = customIcons[name];
	return IconComponent ? React.createElement(IconComponent) : null;
};

/** 将权限菜单树转换为 Ant Design 菜单项。 */
export const getAntdMenuList = (menuList: Menu.MenuOptions[] = []): MenuItem[] => {
	return menuList.map(
		/* 根据当前集合项生成对应的模板或数据。 */ item => ({
			key: item.path,
			icon: createMenuIcon(item.icon),
			label: item.title,
			children: item.children?.length ? getAntdMenuList(item.children) : undefined
		})
	);
};

/** 在菜单树中查找目标页面的完整路径链。 */
export const findMenuPathChain = (menuList: Menu.MenuOptions[] = [], path: string): Menu.MenuOptions[] => {
	// item 表示当前检查的菜单节点。
	for (const item of menuList) {
		if (item.path === path) return [item];
		if (item.children?.length) {
			// 保存递归查找到的子菜单路径链。
			const childChain = findMenuPathChain(item.children, path);
			if (childChain.length) return [item, ...childChain];
		}
	}
	return [];
};

/** 查找当前路径所属的一级菜单。 */
export const findTopMenu = (menuList: Menu.MenuOptions[] = [], path: string) => {
	return findMenuPathChain(menuList, path)[0];
};

/** 读取菜单分支中首个可访问叶子路径。 */
export const getMenuLeafPath = (menu: Menu.MenuOptions): string => {
	if (!menu.children?.length) return menu.path;
	return getMenuLeafPath(menu.children[0]);
};
