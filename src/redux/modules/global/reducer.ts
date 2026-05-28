import { AnyAction } from "redux";
import { GlobalState } from "@/redux/interface";
import produce from "immer";
import * as types from "@/redux/mutation-types";

const globalState: GlobalState = {
	token: "",
	userInfo: "",
	assemblySize: "middle",
	language: "",
	themeConfig: {
		// 榛樿 primary 涓婚棰滆壊
		primary: "#379446",
		// 娣辫壊妯″紡
		isDark: false,
		// 鑹插急妯″紡(weak) || 鐏拌壊妯″紡(gray)
		weakOrGray: "",
		layout: "vertical",
		// 闈㈠寘灞戝鑸?
		breadcrumb: true,
		// 鏍囩椤?
		tabs: true,
		// 椤佃剼
		footer: true
	}
};

// global reducer
const global = (state: GlobalState = globalState, action: AnyAction) =>
	produce(state, draftState => {
		switch (action.type) {
			case types.SET_TOKEN:
				draftState.token = action.token;
				break;
			case types.SET_ASSEMBLY_SIZE:
				draftState.assemblySize = action.assemblySize;
				break;
			case types.SET_LANGUAGE:
				draftState.language = action.language;
				break;
			case types.SET_THEME_CONFIG:
				draftState.themeConfig = action.themeConfig;
				break;
			default:
				return draftState;
		}
	});

export default global;
