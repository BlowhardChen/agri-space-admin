import { AnyAction } from "redux";
import { AuthState } from "@/redux/interface";
import produce from "immer";
import * as types from "@/redux/mutation-types";

/** 定义按钮权限 Redux 模块的初始状态。 */
const authState: AuthState = {
	authButtons: {},
	authRouter: []
};

// auth reducer
const auth = (state: AuthState = authState, action: AnyAction) =>
	produce(
		state,
		/* 基于 Immer 草稿生成不可变 Redux 状态。 */ draftState => {
			switch (action.type) {
				case types.SET_AUTH_BUTTONS:
					draftState.authButtons = action.authButtons;
					break;
				case types.SET_AUTH_ROUTER:
					draftState.authRouter = action.authRouter;
					break;
				case types.RESET_SESSION:
					draftState.authButtons = {};
					draftState.authRouter = [];
					break;
				default:
					return draftState;
			}
		}
	);

export default auth;
