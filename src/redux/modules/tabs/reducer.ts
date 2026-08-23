import { AnyAction } from "redux";
import { TabsState } from "@/redux/interface";
import { HOME_URL } from "@/config/config";
import produce from "immer";
import * as types from "@/redux/mutation-types";

/** 定义标签页 Redux 模块的初始状态。 */
const tabsState: TabsState = {
	// tabsActive 其实没啥用，使用 pathname 就可以了😂
	tabsActive: HOME_URL,
	tabsList: [{ title: "首页", path: HOME_URL }]
};

// tabs reducer
const tabs = (state: TabsState = tabsState, action: AnyAction) =>
	produce(
		state,
		/* 基于 Immer 草稿生成不可变 Redux 状态。 */ draftState => {
			switch (action.type) {
				case types.SET_TABS_LIST:
					draftState.tabsList = action.tabsList;
					break;
				case types.SET_TABS_ACTIVE:
					draftState.tabsActive = action.tabsActive;
					break;
				case types.RESET_SESSION:
					draftState.tabsActive = HOME_URL;
					draftState.tabsList = [];
					break;
				default:
					return draftState;
			}
		}
	);

export default tabs;
