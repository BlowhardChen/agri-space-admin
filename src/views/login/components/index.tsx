import { useEffect, useRef, useState } from "react";

interface AnimatedLoginIllustrationProps {
	activeField?: "username" | "password" | null;
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

const useCursorPosition = () => {
	const [cursor, setCursor] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			setCursor({ x: event.clientX, y: event.clientY });
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return cursor;
};

const useBlinking = () => {
	const [isBlinking, setIsBlinking] = useState(false);

	useEffect(() => {
		let timer: number | undefined;
		let blinkTimer: number | undefined;

		const scheduleBlink = () => {
			timer = window.setTimeout(() => {
				setIsBlinking(true);
				blinkTimer = window.setTimeout(() => {
					setIsBlinking(false);
					scheduleBlink();
				}, 150);
			}, Math.random() * 4000 + 3000);
		};

		scheduleBlink();

		return () => {
			if (timer) window.clearTimeout(timer);
			if (blinkTimer) window.clearTimeout(blinkTimer);
		};
	}, []);

	return isBlinking;
};

const EyeBall = ({ size = 18, pupilSize = 7, maxDistance = 5, isBlinking = false, forceLookX, forceLookY, cursor }: EyeProps) => {
	const eyeRef = useRef<HTMLDivElement>(null);

	const getPupilOffset = () => {
		if (forceLookX !== undefined && forceLookY !== undefined) {
			return { x: forceLookX, y: forceLookY };
		}
		if (!eyeRef.current) return { x: 0, y: 0 };

		const rect = eyeRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const deltaX = cursor.x - centerX;
		const deltaY = cursor.y - centerY;
		const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
		const angle = Math.atan2(deltaY, deltaX);

		return {
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance
		};
	};

	const offset = getPupilOffset();

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

interface PupilProps {
	size?: number;
	maxDistance?: number;
	forceLookX?: number;
	forceLookY?: number;
	cursor: { x: number; y: number };
}

const Pupil = ({ size = 12, maxDistance = 5, forceLookX, forceLookY, cursor }: PupilProps) => {
	const pupilRef = useRef<HTMLDivElement>(null);

	const getPupilOffset = () => {
		if (forceLookX !== undefined && forceLookY !== undefined) {
			return { x: forceLookX, y: forceLookY };
		}
		if (!pupilRef.current) return { x: 0, y: 0 };

		const rect = pupilRef.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const deltaX = cursor.x - centerX;
		const deltaY = cursor.y - centerY;
		const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
		const angle = Math.atan2(deltaY, deltaX);

		return {
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance
		};
	};

	const offset = getPupilOffset();

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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const AnimatedLoginIllustration = ({
	activeField = null,
	passwordVisible = false,
	hasPassword = false
}: AnimatedLoginIllustrationProps) => {
	const cursor = useCursorPosition();
	const purpleRef = useRef<HTMLDivElement>(null);
	const blackRef = useRef<HTMLDivElement>(null);
	const yellowRef = useRef<HTMLDivElement>(null);
	const orangeRef = useRef<HTMLDivElement>(null);
	const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
	const [isPurplePeeking, setIsPurplePeeking] = useState(false);
	const isPurpleBlinking = useBlinking();
	const isBlackBlinking = useBlinking();
	const isTyping = activeField === "username" || activeField === "password";

	useEffect(() => {
		if (!isTyping) {
			setIsLookingAtEachOther(false);
			return;
		}

		setIsLookingAtEachOther(true);
		const timer = window.setTimeout(() => {
			setIsLookingAtEachOther(false);
		}, 800);

		return () => window.clearTimeout(timer);
	}, [activeField, isTyping]);

	useEffect(() => {
		if (!(hasPassword && passwordVisible)) {
			setIsPurplePeeking(false);
			return;
		}

		let intervalId: number | undefined;
		let peekTimer: number | undefined;

		const schedulePeek = () => {
			intervalId = window.setTimeout(() => {
				setIsPurplePeeking(true);
				peekTimer = window.setTimeout(() => {
					setIsPurplePeeking(false);
					schedulePeek();
				}, 800);
			}, Math.random() * 3000 + 2000);
		};

		schedulePeek();

		return () => {
			if (intervalId) window.clearTimeout(intervalId);
			if (peekTimer) window.clearTimeout(peekTimer);
		};
	}, [hasPassword, passwordVisible]);

	const getFaceState = (ref: React.RefObject<HTMLDivElement | null>) => {
		if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };

		const rect = ref.current.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 3;
		const deltaX = cursor.x - centerX;
		const deltaY = cursor.y - centerY;

		return {
			faceX: clamp(deltaX / 20, -15, 15),
			faceY: clamp(deltaY / 30, -10, 10),
			bodySkew: clamp(-deltaX / 120, -6, 6)
		};
	};

	const purple = getFaceState(purpleRef);
	const black = getFaceState(blackRef);
	const yellow = getFaceState(yellowRef);
	const orange = getFaceState(orangeRef);

	return (
		<div className="animated-login-illustration" aria-hidden="true">
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
	);
};

export default AnimatedLoginIllustration;
