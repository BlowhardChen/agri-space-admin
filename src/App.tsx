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

const DEFAULT_PRIMARY_COLOR = "#379446";

const App = (props: any) => {
	const { language, assemblySize, themeConfig, setLanguage, setThemeConfig } = props;
	const [i18nLocale, setI18nLocale] = useState(zhCN);

	useTheme(themeConfig);

	const setAntdLanguage = () => {
		if (language === "zh") return setI18nLocale(zhCN);
		if (language === "en") return setI18nLocale(enUS);
		if (getBrowserLang() === "zh") return setI18nLocale(zhCN);
		if (getBrowserLang() === "en") return setI18nLocale(enUS);
	};

	useEffect(() => {
		if (!themeConfig.primary || themeConfig.primary === "#1890ff") {
			setThemeConfig({ ...themeConfig, primary: DEFAULT_PRIMARY_COLOR });
		}
	}, []);

	useEffect(() => {
		ConfigProvider.config({
			theme: {
				primaryColor: themeConfig.primary || DEFAULT_PRIMARY_COLOR,
				infoColor: themeConfig.primary || DEFAULT_PRIMARY_COLOR
			}
		});
	}, [themeConfig.primary]);

	useEffect(() => {
		i18n.changeLanguage(language || getBrowserLang());
		setLanguage(language || getBrowserLang());
		setAntdLanguage();
	}, [language]);

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

const mapStateToProps = (state: any) => state.global;
const mapDispatchToProps = { setLanguage, setThemeConfig };
export default connect(mapStateToProps, mapDispatchToProps)(App);
