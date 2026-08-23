import screenfull from "screenfull";
import { message } from "antd";
import { useEffect, useState } from "react";

/** 渲染并控制浏览器全屏切换。 */
const Fullscreen = () => {
	// 维护浏览器全屏状态。
	const [fullScreen, setFullScreen] = useState<boolean>(screenfull.isFullscreen);

	useEffect(
		/* 订阅浏览器全屏状态，并在组件卸载时取消订阅。 */ () => {
			screenfull.on(
				"change",
				/* 监听浏览器全屏状态变化。 */ () => {
					if (screenfull.isFullscreen) setFullScreen(true);
					else setFullScreen(false);
					return /* 同步或清理浏览器全屏状态。 */ () => screenfull.off("change", /* 移除浏览器全屏状态监听。 */ () => {});
				}
			);
		},
		[]
	);

	/** 切换浏览器全屏状态。 */
	const handleFullScreen = () => {
		if (!screenfull.isEnabled) message.warning("当前您的浏览器不支持全屏 ❌");
		screenfull.toggle();
	};
	// 渲染 `Fullscreen` 的 JSX 模板。
	return (
		<i className={["icon-style iconfont", fullScreen ? "icon-suoxiao" : "icon-fangda"].join(" ")} onClick={handleFullScreen}></i>
	);
};
export default Fullscreen;
