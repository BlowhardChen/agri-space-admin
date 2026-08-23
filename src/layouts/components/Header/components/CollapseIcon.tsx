import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { updateCollapse } from "@/redux/modules/menu/action";

/** 渲染并控制侧边菜单折叠按钮。 */
const CollapseIcon = (props: any) => {
	// 读取侧栏折叠状态及其更新方法。
	const { isCollapse, updateCollapse } = props;
	// 渲染 `CollapseIcon` 的 JSX 模板。
	return (
		<div
			className="collapsed"
			onClick={
				/* 切换侧边菜单折叠状态。 */ () => {
					updateCollapse(!isCollapse);
				}
			}
		>
			{isCollapse ? <MenuUnfoldOutlined id="isCollapse" /> : <MenuFoldOutlined id="isCollapse" />}
		</div>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.menu;
/** 将全局配置更新操作映射为组件属性。 */
const mapDispatchToProps = { updateCollapse };
export default connect(mapStateToProps, mapDispatchToProps)(CollapseIcon);
