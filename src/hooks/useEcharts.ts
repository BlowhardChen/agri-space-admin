import * as echarts from "echarts";
import { useEffect, useRef } from "react";
/**
 * @description 使用Echarts(只是为了添加图表响应式)
 * @param {Element} data 数据 目前只针对于次Hooks-admin里一些data都是写死在options 所以data为可选 根据项目自行修改即可
 * @param {Object} options 绘制Echarts的参数(必传)
 * @return chart
 * */
export const useEcharts = (options: echarts.EChartsCoreOption, data?: any) => {
	// 保存当前 DOM 节点对应的 ECharts 实例。
	const myChart = useRef<echarts.EChartsType>();
	// 引用 ECharts 容器供图表 Hook 初始化。
	const echartsRef = useRef<HTMLDivElement>(null);

	/** 根据容器尺寸重新调整 ECharts 实例。 */
	const echartsResize = () => {
		echartsRef && myChart?.current?.resize();
	};

	useEffect(
		/* 监听指针移动，并在组件卸载时移除监听。 */ () => {
			if (data?.length !== 0) {
				myChart?.current?.setOption(options);
			}
		},
		[data]
	);

	useEffect(
		/* 监听指针移动，并在组件卸载时移除监听。 */ () => {
			if (echartsRef?.current) {
				myChart.current = echarts.init(echartsRef.current as HTMLDivElement);
			}
			myChart?.current?.setOption(options);
			window.addEventListener("resize", echartsResize, false);
			return /* 在组件卸载时移除事件监听。 */ () => {
				window.removeEventListener("resize", echartsResize);
				myChart?.current?.dispose();
			};
		},
		[]
	);

	return [echartsRef];
};
