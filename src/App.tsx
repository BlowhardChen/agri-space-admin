import { useEffect, useState } from "react";
import { getBrowserLang } from "@/utils/util";
import { ConfigProvider } from "antd";
import { connect } from "react-redux";
import { setLanguage, setThemeConfig } from "@/redux/modules/global/action";
import { HashRouter } from "react-router-dom";
import AuthRouter from "@/routers/utils/authRouter";
import Router from "@/routers/index";
import useTheme from "@/hooks/useTheme";
import zhCN from "antd/lib/locale/zh_CN";
import enUS from "antd/lib/locale/en_US";
import i18n from "i18next";
import "moment/dist/locale/zh-cn";

/** 定义系统默认主题主色。 */
const DEFAULT_PRIMARY_COLOR = "#379446";

/** 挂载路由、国际化和 Ant Design 全局主题配置。 */
const App = (props: any) => {
	// 读取应用语言、组件尺寸、主题配置及其更新方法。
	const { language, assemblySize, themeConfig, setLanguage, setThemeConfig } = props;
	// 维护 Ant Design 当前语言包。
	const [i18nLocale, setI18nLocale] = useState(zhCN);

	useTheme(themeConfig);

	/** 根据当前语言更新 Ant Design Locale。 */
	const setAntdLanguage = () => {
		if (language === "zh") return setI18nLocale(zhCN);
		if (language === "en") return setI18nLocale(enUS);
		if (getBrowserLang() === "zh") return setI18nLocale(zhCN);
		if (getBrowserLang() === "en") return setI18nLocale(enUS);
	};

	useEffect(
		/* 在主题配置变化时同步页面主题样式。 */ () => {
			if (!themeConfig.primary) {
				setThemeConfig({ ...themeConfig, primary: DEFAULT_PRIMARY_COLOR });
			}
		},
		[]
	);

	useEffect(
		/* 在主题配置变化时同步页面主题样式。 */ () => {
			ConfigProvider.config({
				theme: {
					primaryColor: themeConfig.primary || DEFAULT_PRIMARY_COLOR,
					infoColor: themeConfig.primary || DEFAULT_PRIMARY_COLOR
				}
			});
		},
		[themeConfig.primary]
	);

	useEffect(
		/* 在语言变化时同步 Ant Design 语言包。 */ () => {
			i18n.changeLanguage(language || getBrowserLang());
			setLanguage(language || getBrowserLang());
			setAntdLanguage();
		},
		[language]
	);

	// 渲染 `App` 的 JSX 模板。
	return (
		<HashRouter>
			<ConfigProvider locale={i18nLocale} componentSize={assemblySize}>
				<AuthRouter>
					<Router />
				</AuthRouter>
			</ConfigProvider>
		</HashRouter>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setLanguage, setThemeConfig };
export default connect(mapStateToProps, mapDispatchToProps)(App);
