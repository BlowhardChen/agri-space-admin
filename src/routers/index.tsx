import { Navigate, useRoutes } from "react-router-dom";
import { RouteObject } from "@/routers/interface";
import Login from "@/views/login/index";

// * 导入所有router
const metaRouters = import.meta.glob("./modules/*.tsx", { eager: true });

// * 处理路由
export const routerArray: RouteObject[] = [];
Object.keys(metaRouters).forEach(
	/* 遍历当前集合并处理每一项。 */ item => {
		// 读取动态导入路由模块的默认导出。
		const module = metaRouters[item] as any;
		Object.keys(module).forEach(
			/* 遍历当前集合并处理每一项。 */ (key: any) => {
				routerArray.push(...module[key]);
			}
		);
	}
);

/** 定义应用根级路由和错误页路由。 */
export const rootRouter: any[] = [
	{
		path: "/",
		element: <Navigate to="/login" />
	},
	{
		path: "/login",
		element: <Login />,
		meta: {
			requiresAuth: false,
			title: "登录页",
			key: "login"
		}
	},
	...routerArray,
	{
		path: "*",
		element: <Navigate to="/404" />
	}
];

/** 挂载根路由表和路由鉴权组件。 */
const Router = () => {
	// 合并基础路由与自动加载的业务路由。
	const routes = useRoutes(rootRouter);
	return routes;
};

export default Router;
