import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";
import { LayoutIndex } from "@/routers/constant";
import { RouteObject } from "@/routers/interface";
import lazyLoad from "@/routers/utils/lazyLoad";
import { getAuthMenuLeafList } from "@/config/authMenu";
import FeaturePlaceholder from "@/views/common/featurePlaceholder";

interface PageModule {
	default: ComponentType;
}

type PageLoader = () => Promise<PageModule>;

/** 收集 views 下可按业务路径懒加载的 React 页面文件。 */
const pageModules = import.meta.glob("../../views/**/index.tsx") as Record<string, PageLoader>;

/** 根据业务路由路径读取对应页面组件。 */
const resolvePageComponent = (path: string): LazyExoticComponent<ComponentType> | undefined => {
	// 获取与当前业务路径完全一致的页面加载函数。
	const loadPage = pageModules[`../../views${path}/index.tsx`];
	return loadPage ? lazy(loadPage) : undefined;
};

/** 将单个权限菜单叶子节点转换为可渲染路由。 */
const createDynamicRoute = (item: Menu.MenuOptions): RouteObject => {
	// 读取当前菜单路径对应的独立页面组件。
	const PageComponent = resolvePageComponent(item.path);

	// 返回包含页面组件、鉴权要求和菜单标题的路由配置。
	return {
		path: item.path,
		element: PageComponent ? lazyLoad(PageComponent) : <FeaturePlaceholder title={item.title} path={item.path} />,
		meta: {
			requiresAuth: true,
			title: item.title,
			key: item.path.replace(/^\//, "").replaceAll("/", "-")
		}
	};
};

/** 根据权限菜单叶子节点生成与业务路径一致的页面路由。 */
const dynamicPageRoutes: RouteObject[] = getAuthMenuLeafList().map(createDynamicRoute);

/** 将权限业务路由挂载到后台主布局。 */
const dynamicRouter: RouteObject[] = [
	{
		element: <LayoutIndex />,
		children: dynamicPageRoutes
	}
];

export default dynamicRouter;
