import { Dropdown, Menu } from "antd";
import { setAssemblySize } from "@/redux/modules/global/action";
import { connect } from "react-redux";

/** 渲染组件尺寸切换菜单。 */
const AssemblySize = (props: any) => {
	// 维护 Ant Design 全局组件尺寸。
	const { assemblySize, setAssemblySize } = props;

	// 切换组件大小
	const onClick = (e: MenuInfo) => {
		setAssemblySize(e.key);
	};

	// 配置当前下拉组件的菜单项和点击行为。
	const menu = (
		<Menu
			items={[
				{
					key: "middle",
					disabled: assemblySize == "middle",
					label: <span>默认</span>,
					onClick
				},
				{
					disabled: assemblySize == "large",
					key: "large",
					label: <span>大型</span>,
					onClick
				},
				{
					disabled: assemblySize == "small",
					key: "small",
					label: <span>小型</span>,
					onClick
				}
			]}
		/>
	);
	// 渲染 `AssemblySize` 的 JSX 模板。
	return (
		<Dropdown overlay={menu} placement="bottom" trigger={["click"]} arrow={true}>
			<i className="icon-style iconfont icon-contentright"></i>
		</Dropdown>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { setAssemblySize };
export default connect(mapStateToProps, mapDispatchToProps)(AssemblySize);
