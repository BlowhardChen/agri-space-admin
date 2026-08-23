import { useEffect, useMemo, useState } from "react";
import { setAuthButtons, setAuthRouter } from "@/redux/modules/auth/action";
import { updateCollapse, setMenuList } from "@/redux/modules/menu/action";
import { setBreadcrumbList } from "@/redux/modules/breadcrumb/action";
import { getAuthorButtons, getMenuList } from "@/api/modules/login";
import { connect } from "react-redux";
import { findAllBreadcrumb, handleRouter } from "@/utils/util";
import LayoutVertical from "./Layoutvertical";
import LayoutClassic from "./LayoutClassic";
import LayoutTransverse from "./LayoutTransverse";
import LayoutColumns from "./LayoutColumns";
import type { LayoutMode } from "./utils";
import "./index.less";

/** 加载权限数据并选择当前后台布局。 */
const LayoutIndex = (props: any) => {
	// 读取布局配置及权限、菜单、面包屑的 Redux 更新操作。
	const { themeConfig, updateCollapse, setAuthButtons, setBreadcrumbList, setAuthRouter, setMenuList } = props;
	// 维护权限菜单加载状态。
	const [menuLoading, setMenuLoading] = useState(false);

	/** 从路由配置中提取当前页面的按钮权限。 */
	const getAuthButtonsList = async () => {
		try {
			// 读取接口响应中的业务数据。
			const { data } = await getAuthorButtons();
			setAuthButtons(data ?? {});
		} catch {
			setAuthButtons({});
		}
	};

	/** 获取菜单和按钮权限数据。 */
	const getMenuData = async () => {
		setMenuLoading(true);
		try {
			// 读取接口响应中的业务数据。
			const { data = [] } = await getMenuList();
			setBreadcrumbList(findAllBreadcrumb(data));
			setAuthRouter(handleRouter(data));
			setMenuList(data);
		} catch {
			setBreadcrumbList({});
			setAuthRouter([]);
			setMenuList([]);
		} finally {
			setMenuLoading(false);
		}
	};

	useEffect(
		/* 监听指针移动，并在组件卸载时移除监听。 */ () => {
			/** 重新计算并更新图表尺寸。 */
			const handleResize = () => {
				updateCollapse(document.body.clientWidth < 1200);
			};

			handleResize();
			window.addEventListener("resize", handleResize);
			getAuthButtonsList();
			getMenuData();

			return /* 在组件卸载时移除事件监听。 */ () => {
				window.removeEventListener("resize", handleResize);
			};
		},
		[]
	);

	// 保存当前配置对应的布局组件。
	const CurrentLayout = useMemo(
		/* 根据依赖重新计算并缓存派生数据。 */ () => {
			// 建立布局模式与布局组件的映射。
			const layoutMap: Record<LayoutMode, any> = {
				vertical: LayoutVertical,
				classic: LayoutClassic,
				transverse: LayoutTransverse,
				columns: LayoutColumns
			};
			// 读取当前启用的布局模式。
			const currentLayout = (themeConfig.layout ?? "vertical") as LayoutMode;
			return layoutMap[currentLayout] ?? LayoutVertical;
		},
		[themeConfig.layout]
	);

	// 渲染 `LayoutIndex` 的 JSX 模板。
	return <CurrentLayout {...props} menuLoading={menuLoading}></CurrentLayout>;
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => ({
	...state.menu,
	themeConfig: state.global.themeConfig
});
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setAuthButtons, setBreadcrumbList, setAuthRouter, setMenuList, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex);
