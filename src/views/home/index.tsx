import { Tabs } from "antd";
import Pie from "./components/pie";
import Curve from "./components/curve";
import "./index.less";
import BookSum from "./images/book-sum.png";
import AddPerson from "./images/add_person.png";
import AddTeam from "./images/add_team.png";
import Today from "./images/today.png";
import BookSum1 from "./images/book_sum.png";
import BookBg from "./images/book-bg.png";
import GiteeBg from "./images/1-bg.png";
import GitHubBg from "./images/2-bg.png";
import TodayBg from "./images/3-bg.png";
import YesterdayBg from "./images/4-bg.png";

/** 读取 Ant Design 标签页内容组件。 */
const { TabPane } = Tabs;

/** 渲染首页数据概览、访问占比和趋势图表。 */
const Home = () => {
	/** 记录首页图表选择的统计时间范围。 */
	const onChange = (key: string) => {
		console.log(key);
	};

	// 维护首页图表可选择的统计时间范围。
	const tabsList = [
		{ label: "未来7日", name: 1 },
		{ label: "近七日", name: 2 },
		{ label: "近一月", name: 3 },
		{ label: "近三月", name: 4 },
		{ label: "近半年", name: 5 },
		{ label: "近一年", name: 6 }
	];

	// 渲染 `Home` 的 JSX 模板。
	return (
		<div className="dataVisualize-box">
			{/* 汇总访问指标并展示来源占比。 */}
			<div className=" card top-box">
				<div className="top-title">数据可视化</div>
				<Tabs defaultActiveKey="1" onChange={onChange}>
					{tabsList.map(
						/* 根据当前集合项生成对应的模板或数据。 */ item => {
							// 渲染当前访问指标卡片。
							return <TabPane tab={item.label} key={item.name}></TabPane>;
						}
					)}
				</Tabs>
				<div className="top-content">
					<div className="item-left sle" style={{ backgroundImage: `url(${BookBg})` }}>
						<span className="left-title">访问总数</span>
						<div className="img-box">
							<img src={BookSum} alt="" />
						</div>
						<span className="left-number">848.132w</span>
					</div>
					<div className="item-center">
						<div className="gitee-traffic traffic-box" style={{ backgroundImage: `url(${GiteeBg})` }}>
							<div className="traffic-img">
								<img src={AddPerson} alt="" />
							</div>
							<span className="item-value">2222</span>
							<span className="traffic-name sle">Gitee 访问量</span>
						</div>
						<div className="gitHub-traffic traffic-box" style={{ backgroundImage: `url(${GitHubBg})` }}>
							<div className="traffic-img">
								<img src={AddTeam} alt="" />
							</div>
							<span className="item-value">2222</span>
							<span className="traffic-name sle">GitHub 访问量</span>
						</div>
						<div className="today-traffic traffic-box" style={{ backgroundImage: `url(${TodayBg})` }}>
							<div className="traffic-img">
								<img src={Today} alt="" />
							</div>
							<span className="item-value">4567</span>
							<span className="traffic-name sle">今日访问量</span>
						</div>
						<div className="yesterday-traffic traffic-box" style={{ backgroundImage: `url(${YesterdayBg})` }}>
							<div className="traffic-img">
								<img src={BookSum1} alt="" />
							</div>
							<span className="item-value">1234</span>
							<span className="traffic-name sle">昨日访问量</span>
						</div>
					</div>
					<div className="item-right">
						<div className="echarts-title">Gitee / GitHub 访问量占比</div>
						<div className="book-echarts">
							<Pie />
						</div>
					</div>
				</div>
			</div>
			{/* 展示不同时间范围的数据来源趋势。 */}
			<div className="card bottom-box">
				<div className="bottom-title">数据来源</div>
				<div className="bottom-tabs">
					<Tabs defaultActiveKey="1" onChange={onChange}>
						{tabsList.map(
							/* 根据当前集合项生成对应的模板或数据。 */ item => {
								// 渲染当前访问指标卡片。
								return <TabPane tab={item.label} key={item.name}></TabPane>;
							}
						)}
					</Tabs>
				</div>
				<div className="curve-echarts">
					<Curve />
				</div>
			</div>
		</div>
	);
};

export default Home;
