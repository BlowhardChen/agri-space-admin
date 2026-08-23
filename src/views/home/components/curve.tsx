import { useEcharts } from "@/hooks/useEcharts";

/** 初始化并渲染访问来源趋势图。 */
const Curve = () => {
	// 维护访问来源趋势图的演示数据。
	const data = [
		{ value: 30, spotName: "掘金" },
		{ value: 90, spotName: "CSDN" },
		{ value: 10, spotName: "Gitee" },
		{ value: 70, spotName: "GitHub" },
		{ value: 20, spotName: "知乎" },
		{ value: 60, spotName: "MyBlog" },
		{ value: 55, spotName: "简书" },
		{ value: 80, spotName: "StackOverFlow" },
		{ value: 50, spotName: "博客园" }
	];
	// 集中维护当前 ECharts 图表配置。
	const option: any = {
		tooltip: {
			trigger: "axis",
			backgroundColor: "transparent",
			axisPointer: {
				type: "none"
			},
			padding: 0,
			formatter: /* 将当前柱状图数据格式化为悬浮提示卡片。 */ (p: any) => {
				// 获取图表或全屏加载挂载的 DOM 节点。
				let dom = `<div style="width:100%; height: 70px !important; display:flex;flex-direction: column;justify-content: space-between;padding:10px;box-sizing: border-box;
      color:#fff; background: #6B9DFE;border-radius: 4px;font-size:14px; ">
        <div style="display: flex; align-items: center;"> <div style="width:5px;height:5px;background:#ffffff;border-radius: 50%;margin-right:5px"></div>平台 :  ${p[0].name}</div>
        <div style="display: flex;align-items: center;"><div style="width:5px;height:5px;background:#ffffff;border-radius: 50%;margin-right:5px"></div>数据量 :  ${p[0].value}</div>
      </div>`;
				return dom;
			}
		},
		toolbox: {
			show: true,
			orient: "horizontal"
		},
		grid: {
			left: "5%",
			right: "6%"
		},
		dataZoom: [
			{
				show: false,
				height: 10,
				xAxisIndex: [0],
				bottom: 0,
				startValue: 0, //数据窗口范围的起始数值
				endValue: 9, //数据窗口范围的结束数值
				handleStyle: {
					color: "#6b9dfe"
				},
				textStyle: {
					color: "transparent"
				}
			},
			{
				type: "inside",
				show: true,
				height: 0,
				zoomLock: true //控制伸缩
			}
		],
		xAxis: [
			{
				type: "category",
				data: data.map(
					/* 根据当前集合项生成对应的模板或数据。 */ (val: any) => {
						return {
							value: val.spotName
						};
					}
				),
				axisTick: {
					show: false
				},
				axisLabel: {
					// interval: time > 4 ? 27 : 0,
					margin: 20,
					interval: 0,
					color: "#a1a1a1",
					fontSize: 14,
					formatter: /* 截断过长的平台名称以避免坐标轴拥挤。 */ function (name: string) {
						undefined;
						return name.length > 8 ? name.slice(0, 8) + "..." : name;
					}
				},
				axisLine: {
					lineStyle: {
						color: "#F6F6F7",
						width: 2
					}
				}
			}
		],
		yAxis: [
			{
				min: 0,
				axisLine: {
					show: false
				},
				axisTick: {
					show: false
				},
				splitLine: {
					show: true,
					lineStyle: {
						type: "dashed",
						color: "#edeff5",
						width: 2
					}
				},
				axisLabel: {
					color: "#a1a1a1",
					fontSize: 16,
					fontWeight: 400,
					formatter: /* 将万级纵轴数值转换为带 w 后缀的文本。 */ function (value: number) {
						if (value === 0) {
							return value;
						} else if (value >= 10000) {
							return value / 10000 + "w";
						}
						return value;
					}
				}
			}
		],
		series: [
			{
				name: "Direct",
				type: "bar",
				data: data.map(
					/* 根据当前集合项生成对应的模板或数据。 */ (val: any) => {
						return {
							value: val.value
						};
					}
				),
				barWidth: "45px",
				itemStyle: {
					color: "#C5D8FF",
					borderRadius: [12, 12, 0, 0]
				},
				emphasis: {
					itemStyle: {
						color: "#6B9DFE"
					}
				}
			}
		]
	};
	// 引用 ECharts 容器供图表 Hook 初始化。
	const [echartsRef] = useEcharts(option, data);
	// 渲染 `Curve` 的 JSX 模板。
	return <div ref={echartsRef} className="content-box"></div>;
};

export default Curve;
