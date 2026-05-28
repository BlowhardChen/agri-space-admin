import { Switch } from "antd";
import { MoonFilled, SunFilled } from "@ant-design/icons";
import { connect } from "react-redux";
import { setThemeConfig } from "@/redux/modules/global/action";

const SwitchDark = (props: any) => {
	const { setThemeConfig, themeConfig } = props;
	const onChange = (checked: boolean) => {
		setThemeConfig({ ...themeConfig, isDark: checked });
	};

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

const mapStateToProps = (state: any) => state.global;
const mapDispatchToProps = { setThemeConfig };
export default connect(mapStateToProps, mapDispatchToProps)(SwitchDark);
