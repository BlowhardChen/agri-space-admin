import logo from "@/assets/images/logo.png";
import { connect } from "react-redux";

/** 根据侧栏状态渲染系统标识和标题。 */
const Logo = (props: any) => {
	// 读取侧边菜单的折叠状态。
	const collapsed = props.collapsed ?? props.isCollapse;
	// 读取系统标题配置。
	const title = props.title ?? "农域管理后台";

	// 渲染 `Logo` 的 JSX 模板。
	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{!collapsed && title ? <h2 className="logo-text">{title}</h2> : null}
		</div>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.menu;
export default connect(mapStateToProps)(Logo) as any;
