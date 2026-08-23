import { AnyAction } from "redux";
import { MenuState } from "@/redux/interface";
import produce from "immer";
import * as types from "@/redux/mutation-types";

/** 定义菜单 Redux 模块的初始状态。 */
const menuState: MenuState = {
	isCollapse: false,
	menuList: []
};

// menu reducer
const menu = (state: MenuState = menuState, action: AnyAction) =>
	produce(
		state,
		/* 基于 Immer 草稿生成不可变 Redux 状态。 */ draftState => {
			switch (action.type) {
				case types.UPDATE_COLLAPSE:
					draftState.isCollapse = action.isCollapse;
					break;
				case types.SET_MENU_LIST:
					draftState.menuList = action.menuList;
					break;
				case types.RESET_SESSION:
					draftState.menuList = [];
					break;
				default:
					return draftState;
			}
		}
	);

export default menu;
