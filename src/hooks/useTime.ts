import moment from "moment";
import { useEffect, useState, useRef } from "react";

/**
 * @description 获取本地时间
 */
export const useTimes = () => {
	// 记录当前定时器，便于副作用清理。
	const timer: any = useRef(null);
	// 维护页面展示的当前时间。
	const [time, setTime] = useState(moment().format("YYYY年MM月DD日 HH:mm:ss"));
	useEffect(
		/* 启动周期任务，并在依赖变化或组件卸载时清理。 */ () => {
			timer.current = setInterval(
				/* 按固定间隔更新当前时间。 */ () => {
					setTime(moment().format("YYYY年MM月DD日 HH:mm:ss"));
				},
				1000
			);
			return /* 在副作用清理阶段取消周期任务。 */ () => {
				clearInterval(timer.current);
			};
		},
		[time]
	);

	return {
		time
	};
};
