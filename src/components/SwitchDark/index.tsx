import { Switch } from "antd";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import { connect } from "react-redux";
import { setThemeConfig } from "@/redux/modules/global/action";

/** 渲染并切换明暗主题开关。 */
const SwitchDark = (props: any) => {
	// 读取全局主题配置及其更新方法。
	const { setThemeConfig, themeConfig } = props;
	/** 将开关状态写入全局明暗主题配置。 */
	const onChange = (checked: boolean) => {
		setThemeConfig({ ...themeConfig, isDark: checked });
	};

	// 渲染 `SwitchDark` 的 JSX 模板。
	return (
		<Switch
			className="dark"
			checked={themeConfig.isDark}
			checkedChildren={<MoonFilled />}
			unCheckedChildren={<SunFilled />}
			onChange={onChange}
		/>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setThemeConfig };
export default connect(mapStateToProps, mapDispatchToProps)(SwitchDark);
