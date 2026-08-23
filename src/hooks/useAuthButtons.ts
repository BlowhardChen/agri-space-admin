import { searchRoute } from "@/utils/util";
import { useLocation } from "react-router-dom";
import { routerArray } from "@/routers";
import { store } from "@/redux";

/**
 * @description 页面按钮权限 hooks
 * */
const useAuthButtons = () => {
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 查找与当前路径匹配的路由配置。
	const route = searchRoute(pathname, routerArray);

	return {
		BUTTONS: store.getState().auth.authButtons[route.meta!.key!] || {}
	};
};

export default useAuthButtons;
