import { useEffect, useMemo, useState } from "react";
import { setAuthButtons, setAuthRouter } from "@/redux/modules/auth/action";
import { updateCollapse, setMenuList } from "@/redux/modules/menu/action";
import { setBreadcrumbList } from "@/redux/modules/breadcrumb/action";
import { getAuthorButtons, getMenuList } from "@/api/modules/login";
import { getMockAuthButtons, getMockMenuList, isMockToken } from "@/api/modules/loginMock";
import { connect } from "react-redux";
import { findAllBreadcrumb, handleRouter } from "@/utils/util";
import LayoutVertical from "./Layoutvertical";
import LayoutClassic from "./LayoutClassic";
import LayoutTransverse from "./LayoutTransverse";
import LayoutColumns from "./LayoutColumns";
import type { LayoutMode } from "./utils";
import "./index.less";

const LayoutIndex = (props: any) => {
	const { themeConfig, token, updateCollapse, setAuthButtons, setBreadcrumbList, setAuthRouter, setMenuList } = props;
	const [menuLoading, setMenuLoading] = useState(false);

	const getAuthButtonsList = async () => {
		try {
			const { data } = await getAuthorButtons();
			setAuthButtons(data);
		} catch (error) {
			if (!isMockToken(token)) throw error;
			const { data } = await getMockAuthButtons();
			setAuthButtons(data);
		}
	};

	const getMenuData = async () => {
		setMenuLoading(true);
		try {
			let data: Menu.MenuOptions[] | undefined;
			try {
				const response = await getMenuList();
				data = response.data;
			} catch (error) {
				if (!isMockToken(token)) throw error;
				const response = await getMockMenuList();
				data = response.data;
			}
			if (!data) return;
			setBreadcrumbList(findAllBreadcrumb(data));
			setAuthRouter(handleRouter(data));
			setMenuList(data);
		} finally {
			setMenuLoading(false);
		}
	};

	useEffect(() => {
		const handleResize = () => {
			updateCollapse(document.body.clientWidth < 1200);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		getAuthButtonsList();
		getMenuData();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const CurrentLayout = useMemo(() => {
		const layoutMap: Record<LayoutMode, any> = {
			vertical: LayoutVertical,
			classic: LayoutClassic,
			transverse: LayoutTransverse,
			columns: LayoutColumns
		};
		const currentLayout = (themeConfig.layout ?? "vertical") as LayoutMode;
		return layoutMap[currentLayout] ?? LayoutVertical;
	}, [themeConfig.layout]);

	return <CurrentLayout {...props} menuLoading={menuLoading}></CurrentLayout>;
};

const mapStateToProps = (state: any) => ({
	...state.menu,
	themeConfig: state.global.themeConfig,
	token: state.global.token
});
const mapDispatchToProps = { setAuthButtons, setBreadcrumbList, setAuthRouter, setMenuList, updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(LayoutIndex);
