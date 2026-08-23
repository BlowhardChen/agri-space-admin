import ReactDOM from "react-dom/client";
import Loading from "@/components/Loading";

/** 记录仍需显示全屏加载的请求数量。 */
let needLoadingRequestCount = 0;

// * 显示loading
export const showFullScreenLoading = () => {
	if (needLoadingRequestCount === 0) {
		// 获取图表或全屏加载挂载的 DOM 节点。
		let dom = document.createElement("div");
		dom.setAttribute("id", "loading");
		document.body.appendChild(dom);
		ReactDOM.createRoot(dom).render(<Loading />);
	}
	needLoadingRequestCount++;
};

// * 隐藏loading
export const tryHideFullScreenLoading = () => {
	if (needLoadingRequestCount <= 0) return;
	needLoadingRequestCount--;
	if (needLoadingRequestCount === 0) {
		document.body.removeChild(document.getElementById("loading") as HTMLElement);
	}
};
