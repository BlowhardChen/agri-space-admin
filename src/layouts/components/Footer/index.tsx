import { connect } from "react-redux";
import "./index.less";

/** 根据全局配置渲染页脚。 */
const LayoutFooter = (props: any) => {
	// 读取当前全局主题配置。
	const { themeConfig } = props;
	// 渲染 `LayoutFooter` 的 JSX 模板。
	return (
		<>
			{!themeConfig.footer && (
				<div className="footer">
					<a href="https://github.com/BlowhardChen/agri-space-admin" target="_blank" rel="noreferrer">
						2026 © Agri-Space-Admin By BlowhardChen Technology.
					</a>
				</div>
			)}
		</>
	);
};

/** 将 Redux 全局配置映射为组件属性。 */
const mapStateToProps = (state: any) => state.global;
export default connect(mapStateToProps)(LayoutFooter);
