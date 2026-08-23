import { useEffect, useRef, useState, type RefObject } from "react";
import StatusCardIcon, { type StatusCardIconName } from "./StatusCardIcons";

interface LoginShowcaseProps {
	activeField?: "username" | "password" | "phone" | "captcha" | null;
	passwordVisible?: boolean;
	hasPassword?: boolean;
}

interface EyeProps {
	size?: number;
	pupilSize?: number;
	maxDistance?: number;
	isBlinking?: boolean;
	forceLookX?: number;
	forceLookY?: number;
	cursor: { x: number; y: number };
}

interface PupilProps {
	size?: number;
	maxDistance?: number;
	forceLookX?: number;
	forceLookY?: number;
	cursor: { x: number; y: number };
}

/** 维护登录页展示的农业状态卡片内容。 */
const statusCards = [
	{ icon: "crop" as StatusCardIconName, label: "作物长势" },
	{ icon: "humidity" as StatusCardIconName, label: "土壤湿度" },
	{ icon: "irrigation" as StatusCardIconName, label: "灌溉状态" },
	{ icon: "yield" as StatusCardIconName, label: "产量预测" }
];

/** 监听并返回页面指针坐标。 */
const useCursorPosition = () => {
	// 维护页面指针坐标。
	const [cursor, setCursor] = useState({ x: 0, y: 0 });

	useEffect(
		/* 监听指针移动，并在组件卸载时移除监听。 */ () => {
			/** 记录指针坐标以驱动角色视线动画。 */
			const handleMouseMove = (event: MouseEvent) => {
				setCursor({ x: event.clientX, y: event.clientY });
			};

			window.addEventListener("mousemove", handleMouseMove);
			return /* 在组件卸载时移除事件监听。 */ () => window.removeEventListener("mousemove", handleMouseMove);
		},
		[]
	);

	return cursor;
};

/** 维护角色随机眨眼状态及其定时器。 */
const useBlinking = () => {
	// 维护角色当前眨眼状态。
	const [isBlinking, setIsBlinking] = useState(false);

	useEffect(
		/* 安排延迟状态更新，并在依赖变化时清理定时器。 */ () => {
			// 记录当前定时器，便于副作用清理。
			let timer: number | undefined;
			// 记录眨眼定时器，便于副作用清理。
			let blinkTimer: number | undefined;

			/** 安排角色眼睛的下一次眨眼动画。 */
			const scheduleBlink = () => {
				timer = window.setTimeout(
					/* 延迟执行角色动画或状态更新。 */ () => {
						setIsBlinking(true);
						blinkTimer = window.setTimeout(
							/* 延迟执行角色动画或状态更新。 */ () => {
								setIsBlinking(false);
								scheduleBlink();
							},
							150
						);
					},
					Math.random() * 4000 + 3000
				);
			};

			scheduleBlink();

			return /* 在副作用清理阶段取消定时器。 */ () => {
				if (timer) window.clearTimeout(timer);
				if (blinkTimer) window.clearTimeout(blinkTimer);
			};
		},
		[]
	);

	return isBlinking;
};

/** 根据眨眼状态渲染角色眼睛。 */
const EyeBall = ({ size = 18, pupilSize = 7, maxDistance = 5, isBlinking = false, forceLookX, forceLookY, cursor }: EyeProps) => {
	// 引用角色眼睛元素以计算瞳孔位置。
	const eyeRef = useRef<HTMLDivElement>(null);

	/** 计算瞳孔跟随指针移动的受限偏移量。 */
	const getPupilOffset = () => {
		if (forceLookX !== undefined && forceLookY !== undefined) {
			return { x: forceLookX, y: forceLookY };
		}
		if (!eyeRef.current) return { x: 0, y: 0 };

		// 读取元素视口边界以计算指针偏移。
		const rect = eyeRef.current.getBoundingClientRect();
		// 计算目标元素中心的横坐标。
		const centerX = rect.left + rect.width / 2;
		// 计算目标元素中心的纵坐标。
		const centerY = rect.top + rect.height / 2;
		// 计算指针与元素中心的横向距离。
		const deltaX = cursor.x - centerX;
		// 计算指针与元素中心的纵向距离。
		const deltaY = cursor.y - centerY;
		// 限制角色跟随指针的最大移动距离。
		const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
		// 计算指针相对角色中心的方向角。
		const angle = Math.atan2(deltaY, deltaX);

		return {
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance
		};
	};

	// 计算视觉元素跟随指针的偏移量。
	const offset = getPupilOffset();

	// 渲染 `EyeBall` 的 JSX 模板。
	return (
		<div
			ref={eyeRef}
			className={`character-eye ${isBlinking ? "is-blinking" : ""}`}
			style={{ width: size, height: isBlinking ? 2 : size }}
		>
			{!isBlinking && (
				<div
					className="character-eye-pupil"
					style={{
						width: pupilSize,
						height: pupilSize,
						transform: `translate(${offset.x}px, ${offset.y}px)`
					}}
				/>
			)}
		</div>
	);
};

/** 根据指针位置渲染角色瞳孔偏移。 */
const Pupil = ({ size = 12, maxDistance = 5, forceLookX, forceLookY, cursor }: PupilProps) => {
	// 引用角色瞳孔元素以应用位移动画。
	const pupilRef = useRef<HTMLDivElement>(null);

	/** 计算瞳孔跟随指针移动的受限偏移量。 */
	const getPupilOffset = () => {
		if (forceLookX !== undefined && forceLookY !== undefined) {
			return { x: forceLookX, y: forceLookY };
		}
		if (!pupilRef.current) return { x: 0, y: 0 };

		// 读取元素视口边界以计算指针偏移。
		const rect = pupilRef.current.getBoundingClientRect();
		// 计算目标元素中心的横坐标。
		const centerX = rect.left + rect.width / 2;
		// 计算目标元素中心的纵坐标。
		const centerY = rect.top + rect.height / 2;
		// 计算指针与元素中心的横向距离。
		const deltaX = cursor.x - centerX;
		// 计算指针与元素中心的纵向距离。
		const deltaY = cursor.y - centerY;
		// 限制角色跟随指针的最大移动距离。
		const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
		// 计算指针相对角色中心的方向角。
		const angle = Math.atan2(deltaY, deltaX);

		return {
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance
		};
	};

	// 计算视觉元素跟随指针的偏移量。
	const offset = getPupilOffset();

	// 渲染 `Pupil` 的 JSX 模板。
	return (
		<div
			ref={pupilRef}
			className="character-pupil"
			style={{
				width: size,
				height: size,
				transform: `translate(${offset.x}px, ${offset.y}px)`
			}}
		/>
	);
};

/** 将数值限制在指定上下界之间。 */
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** 渲染登录页品牌文案、状态卡片和角色动画。 */
const LoginShowcase = ({ activeField = null, passwordVisible = false, hasPassword = false }: LoginShowcaseProps) => {
	// 读取用于角色动画的当前指针坐标。
	const cursor = useCursorPosition();
	// 引用紫色角色元素以计算视口位置。
	const purpleRef = useRef<HTMLDivElement>(null);
	// 引用黑色角色元素以计算视口位置。
	const blackRef = useRef<HTMLDivElement>(null);
	// 引用黄色角色元素以计算视口位置。
	const yellowRef = useRef<HTMLDivElement>(null);
	// 引用橙色角色元素以计算视口位置。
	const orangeRef = useRef<HTMLDivElement>(null);
	// 维护角色是否相互注视的动画状态。
	const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
	// 维护紫色角色的偷看动画状态。
	const [isPurplePeeking, setIsPurplePeeking] = useState(false);
	// 读取紫色角色当前是否正在眨眼。
	const isPurpleBlinking = useBlinking();
	// 读取黑色角色当前是否正在眨眼。
	const isBlackBlinking = useBlinking();
	// 判断用户是否正在编辑登录字段。
	const isTyping =
		activeField === "username" || activeField === "password" || activeField === "phone" || activeField === "captcha";

	useEffect(
		/* 安排延迟状态更新，并在依赖变化时清理定时器。 */ () => {
			if (!isTyping) {
				setIsLookingAtEachOther(false);
				return;
			}

			setIsLookingAtEachOther(true);
			// 记录当前定时器，便于副作用清理。
			const timer = window.setTimeout(
				/* 延迟执行角色动画或状态更新。 */ () => {
					setIsLookingAtEachOther(false);
				},
				800
			);

			return /* 在副作用清理阶段取消定时器。 */ () => window.clearTimeout(timer);
		},
		[activeField, isTyping]
	);

	useEffect(
		/* 安排延迟状态更新，并在依赖变化时清理定时器。 */ () => {
			if (!(hasPassword && passwordVisible)) {
				setIsPurplePeeking(false);
				return;
			}

			// 记录轮询定时器，便于副作用清理。
			let intervalId: number | undefined;
			// 记录角色偷看动画定时器，便于副作用清理。
			let peekTimer: number | undefined;

			/** 安排密码可见状态下的角色偷看动画。 */
			const schedulePeek = () => {
				intervalId = window.setTimeout(
					/* 延迟执行角色动画或状态更新。 */ () => {
						setIsPurplePeeking(true);
						peekTimer = window.setTimeout(
							/* 延迟执行角色动画或状态更新。 */ () => {
								setIsPurplePeeking(false);
								schedulePeek();
							},
							800
						);
					},
					Math.random() * 3000 + 2000
				);
			};

			schedulePeek();

			return /* 在副作用清理阶段取消定时器。 */ () => {
				if (intervalId) window.clearTimeout(intervalId);
				if (peekTimer) window.clearTimeout(peekTimer);
			};
		},
		[hasPassword, passwordVisible]
	);

	/** 根据指针位置计算角色面部倾斜和视线状态。 */
	const getFaceState = (ref: RefObject<HTMLDivElement | null>) => {
		if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

		// 读取元素视口边界以计算指针偏移。
		const rect = ref.current.getBoundingClientRect();
		// 计算目标元素中心的横坐标。
		const centerX = rect.left + rect.width / 2;
		// 计算目标元素中心的纵坐标。
		const centerY = rect.top + rect.height / 3;
		// 计算指针与元素中心的横向距离。
		const deltaX = cursor.x - centerX;
		// 计算指针与元素中心的纵向距离。
		const deltaY = cursor.y - centerY;

		return {
			faceX: clamp(deltaX / 20, -15, 15),
			faceY: clamp(deltaY / 30, -10, 10),
			bodySkew: clamp(-deltaX / 120, -6, 6)
		};
	};

	// 计算紫色角色的视线与倾斜状态。
	const purple = getFaceState(purpleRef);
	// 计算黑色角色的视线与倾斜状态。
	const black = getFaceState(blackRef);
	// 计算黄色角色的视线与倾斜状态。
	const yellow = getFaceState(yellowRef);
	// 计算橙色角色的视线与倾斜状态。
	const orange = getFaceState(orangeRef);

	// 渲染 `LoginShowcase` 的 JSX 模板。
	return (
		<div className="login-showcase" aria-hidden="true">
			{/* 登录页品牌定位与产品说明。 */}
			<div className="showcase-copy">
				<h2>
					数字农业
					<span className="showcase-copy__dot" />
					智慧管理
				</h2>
				<p>让农业管理更高效，让土地更有价值</p>
			</div>

			<div className="showcase-field" />
			<div className="showcase-field-rows" />

			<div className="showcase-drone">
				<span className="showcase-drone__prop showcase-drone__prop--lt" />
				<span className="showcase-drone__prop showcase-drone__prop--rt" />
				<span className="showcase-drone__prop showcase-drone__prop--lb" />
				<span className="showcase-drone__prop showcase-drone__prop--rb" />
				<span className="showcase-drone__arm showcase-drone__arm--lt" />
				<span className="showcase-drone__arm showcase-drone__arm--rt" />
				<span className="showcase-drone__arm showcase-drone__arm--lb" />
				<span className="showcase-drone__arm showcase-drone__arm--rb" />
				<span className="showcase-drone__body" />
				<span className="showcase-drone__camera" />
			</div>

			<div className="showcase-network">
				<span className="showcase-network__ring showcase-network__ring--outer" />
				<span className="showcase-network__ring showcase-network__ring--middle" />
				<span className="showcase-network__ring showcase-network__ring--inner" />
				<span className="showcase-network__core" />
			</div>

			{/* 农业生产状态快捷卡片。 */}
			<div className="showcase-cards">
				{statusCards.map(
					/* 根据当前集合项生成对应的模板或数据。 */ card => (
						<div className="showcase-card" key={card.label}>
							<div className="showcase-card__icon">
								<StatusCardIcon className="showcase-card__icon-svg" name={card.icon} />
							</div>
							<div className="showcase-card__content">
								<span>{card.label}</span>
							</div>
						</div>
					)
				)}
			</div>

			{/* 根据表单焦点、输入和密码可见状态驱动角色动画。 */}
			<div className="animated-login-illustration">
				<div className="character-stage">
					<div
						ref={purpleRef}
						className="character-block character-purple"
						style={{
							height: isTyping || (hasPassword && !passwordVisible) ? 440 : 400,
							transform:
								hasPassword && passwordVisible
									? "skewX(0deg)"
									: isTyping || (hasPassword && !passwordVisible)
									? `skewX(${purple.bodySkew - 12}deg) translateX(40px)`
									: `skewX(${purple.bodySkew}deg)`
						}}
					>
						<div
							className="character-eyes"
							style={{
								left: hasPassword && passwordVisible ? 20 : isLookingAtEachOther ? 55 : 45 + purple.faceX,
								top: hasPassword && passwordVisible ? 35 : isLookingAtEachOther ? 65 : 40 + purple.faceY
							}}
						>
							<EyeBall
								cursor={cursor}
								isBlinking={isPurpleBlinking}
								forceLookX={hasPassword && passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
								forceLookY={hasPassword && passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
							/>
							<EyeBall
								cursor={cursor}
								isBlinking={isPurpleBlinking}
								forceLookX={hasPassword && passwordVisible ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
								forceLookY={hasPassword && passwordVisible ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined}
							/>
						</div>
					</div>

					<div
						ref={blackRef}
						className="character-block character-black"
						style={{
							transform:
								hasPassword && passwordVisible
									? "skewX(0deg)"
									: isLookingAtEachOther
									? `skewX(${black.bodySkew * 1.5 + 10}deg) translateX(20px)`
									: `skewX(${black.bodySkew * 1.5}deg)`
						}}
					>
						<div
							className="character-eyes character-eyes-black"
							style={{
								left: hasPassword && passwordVisible ? 10 : isLookingAtEachOther ? 32 : 26 + black.faceX,
								top: hasPassword && passwordVisible ? 28 : isLookingAtEachOther ? 12 : 32 + black.faceY
							}}
						>
							<EyeBall
								cursor={cursor}
								size={16}
								pupilSize={6}
								maxDistance={4}
								isBlinking={isBlackBlinking}
								forceLookX={hasPassword && passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
							/>
							<EyeBall
								cursor={cursor}
								size={16}
								pupilSize={6}
								maxDistance={4}
								isBlinking={isBlackBlinking}
								forceLookX={hasPassword && passwordVisible ? -4 : isLookingAtEachOther ? 0 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : isLookingAtEachOther ? -4 : undefined}
							/>
						</div>
					</div>

					<div
						ref={orangeRef}
						className="character-block character-orange"
						style={{
							transform: hasPassword && passwordVisible ? "skewX(0deg)" : `skewX(${orange.bodySkew}deg)`
						}}
					>
						<div
							className="character-eyes character-eyes-pupil"
							style={{
								left: hasPassword && passwordVisible ? 50 : 82 + orange.faceX,
								top: hasPassword && passwordVisible ? 85 : 90 + orange.faceY
							}}
						>
							<Pupil
								cursor={cursor}
								forceLookX={hasPassword && passwordVisible ? -5 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : undefined}
							/>
							<Pupil
								cursor={cursor}
								forceLookX={hasPassword && passwordVisible ? -5 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : undefined}
							/>
						</div>
					</div>

					<div
						ref={yellowRef}
						className="character-block character-yellow"
						style={{
							transform: hasPassword && passwordVisible ? "skewX(0deg)" : `skewX(${yellow.bodySkew}deg)`
						}}
					>
						<div
							className="character-eyes character-eyes-pupil"
							style={{
								left: hasPassword && passwordVisible ? 20 : 52 + yellow.faceX,
								top: hasPassword && passwordVisible ? 35 : 40 + yellow.faceY
							}}
						>
							<Pupil
								cursor={cursor}
								forceLookX={hasPassword && passwordVisible ? -5 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : undefined}
							/>
							<Pupil
								cursor={cursor}
								forceLookX={hasPassword && passwordVisible ? -5 : undefined}
								forceLookY={hasPassword && passwordVisible ? -4 : undefined}
							/>
						</div>
						<div
							className="character-mouth"
							style={{
								left: hasPassword && passwordVisible ? 10 : 40 + yellow.faceX,
								top: hasPassword && passwordVisible ? 88 : 88 + yellow.faceY
							}}
						/>
					</div>
				</div>
			</div>

			<div className="showcase-hill" />

			<div className="showcase-sprout showcase-sprout--left">
				<span />
				<span />
			</div>
			<div className="showcase-sprout showcase-sprout--right">
				<span />
				<span />
			</div>
		</div>
	);
};

export default LoginShowcase;
