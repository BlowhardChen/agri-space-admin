import { Dropdown, Menu } from "antd";
import { connect } from "react-redux";
import { setLanguage } from "@/redux/modules/global/action";

/** 渲染并处理系统语言切换菜单。 */
const Language = (props: any) => {
	// 读取当前语言及其更新方法。
	const { language, setLanguage } = props;

	// 配置当前下拉组件的菜单项和点击行为。
	const menu = (
		<Menu
			items={[
				{
					key: "1",
					label: <span>简体中文</span>,
					onClick: /* 将系统语言切换为简体中文。 */ () => setLanguage("zh"),
					disabled: language === "zh"
				},
				{
					key: "2",
					label: <span>English</span>,
					onClick: /* 将系统语言切换为英文。 */ () => setLanguage("en"),
					disabled: language === "en"
				}
			]}
		/>
	);
	// 渲染 `Language` 的 JSX 模板。
	return (
		<Dropdown overlay={menu} placement="bottom" trigger={["click"]} arrow={true}>
			<i className="icon-style iconfont icon-zhongyingwen"></i>
		</Dropdown>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setLanguage };
export default connect(mapStateToProps, mapDispatchToProps)(Language);
