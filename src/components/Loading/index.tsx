import { Spin } from "antd";
import "./index.less";

/** 渲染应用级加载指示器。 */
const Loading = ({ tip = "Loading" }: { tip?: string }) => {
	// 渲染 `Loading` 的 JSX 模板。
	return <Spin tip={tip} size="large" className="request-loading" />;
};

export default Loading;
