import { useLocation, Navigate } from "react-router-dom";
import { AxiosCanceler } from "@/api/helper/axiosCancel";
import { searchRoute } from "@/utils/util";
import { rootRouter } from "@/routers/index";
import { HOME_URL } from "@/config/config";
import { store } from "@/redux/index";

/** 创建用于统一管理重复请求的取消器。 */
const axiosCanceler = new AxiosCanceler();

/**
 * @description 路由守卫组件
 * */
const AuthRouter = (props: { children: JSX.Element }) => {
	// 读取当前路由路径。
	const { pathname } = useLocation();
	// 查找与当前路径匹配的路由配置。
	const route = searchRoute(pathname, rootRouter);
	// 读取当前访问令牌。
	const token = store.getState().global.token;
	// * 在跳转路由之前，清除所有的请求
	axiosCanceler.removeAllPending();

	// * 判断当前路由是否需要访问权限(不需要权限直接放行)
	if (!route.meta?.requiresAuth) {
		// 已登录用户访问登录页时直接返回首页。
		if (pathname === "/login" && token) /* // 渲染 `AuthRouter` 的 JSX 模板。 */ return <Navigate to={HOME_URL} replace />;
		return props.children;
	}

	// * 判断是否有Token
	// 未登录用户访问受保护页面时跳转登录页。
	if (!token) /* // 渲染 `AuthRouter` 的 JSX 模板。 */ return <Navigate to="/login" replace />;

	// * Dynamic Router(动态路由，根据后端返回的菜单数据生成的一维数组)
	const dynamicRouter = store.getState().auth.authRouter;
	// * Static Router(静态路由，必须配置首页地址，否则不能进首页获取菜单、按钮权限等数据)，获取数据的时候会loading，所有配置首页地址也没问题
	const staticRouter = [HOME_URL, "/403"];
	// 将路由模块整理为可遍历的路由列表。
	const routerList = dynamicRouter.concat(staticRouter);
	// * 如果访问的地址没有在路由表中重定向到403页面
	// 当前账号无目标路由权限时跳转无权限页面。
	if (routerList.indexOf(pathname) == -1) /* // 渲染 `AuthRouter` 的 JSX 模板。 */ return <Navigate to="/403" />;

	// * 当前账号有权限返回 Router，正常访问页面
	return props.children;
};

export default AuthRouter;
