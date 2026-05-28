import React from "react";
import type { MenuProps } from "antd";
import * as Icons from "@ant-design/icons";

export type LayoutMode = "vertical" | "classic" | "transverse" | "columns";
export type MenuItem = Required<MenuProps>["items"][number];

const customIcons = Icons as unknown as Record<string, React.ComponentType>;

export const createMenuIcon = (name?: string) => {
	if (!name) return null;
	const IconComponent = customIcons[name];
	return IconComponent ? React.createElement(IconComponent) : null;
};

export const getAntdMenuList = (menuList: Menu.MenuOptions[] = []): MenuItem[] => {
	return menuList.map(item => ({
		key: item.path,
		icon: createMenuIcon(item.icon),
		label: item.title,
		children: item.children?.length ? getAntdMenuList(item.children) : undefined
	}));
};

export const findMenuPathChain = (menuList: Menu.MenuOptions[] = [], path: string): Menu.MenuOptions[] => {
	for (const item of menuList) {
		if (item.path === path) return [item];
		if (item.children?.length) {
			const childChain = findMenuPathChain(item.children, path);
			if (childChain.length) return [item, ...childChain];
		}
	}
	return [];
};

export const findTopMenu = (menuList: Menu.MenuOptions[] = [], path: string) => {
	return findMenuPathChain(menuList, path)[0];
};

export const getMenuLeafPath = (menu: Menu.MenuOptions): string => {
	if (!menu.children?.length) return menu.path;
	return getMenuLeafPath(menu.children[0]);
};
