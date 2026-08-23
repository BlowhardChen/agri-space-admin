import { AnyAction } from "redux";
import { BreadcrumbState } from "@/redux/interface";
import produce from "immer";
import * as types from "@/redux/mutation-types";

/** 定义面包屑 Redux 模块的初始状态。 */
const breadcrumbState: BreadcrumbState = {
	breadcrumbList: {}
};

// breadcrumb reducer
const breadcrumb = (state: BreadcrumbState = breadcrumbState, action: AnyAction) =>
	produce(
		state,
		/* 基于 Immer 草稿生成不可变 Redux 状态。 */ draftState => {
			switch (action.type) {
				case types.SET_BREADCRUMB_LIST:
					draftState.breadcrumbList = action.breadcrumbList;
					break;
				case types.RESET_SESSION:
					draftState.breadcrumbList = {};
					break;
				default:
					return draftState;
			}
		}
	);

export default breadcrumb;
