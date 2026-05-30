import type { SVGProps } from "react";

export type StatusCardIconName = "crop" | "humidity" | "irrigation" | "yield";

interface StatusCardIconProps extends SVGProps<SVGSVGElement> {
	name: StatusCardIconName;
}

const CropIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="M15.8 14.4C13.3 10.6 8.86 8.65 4.8 9.47c-.44 4.16 1.68 8.54 5.58 10.79 1.74 1 3.69 1.42 5.42 1.33V14.4Z"
			fill="currentColor"
			opacity="0.96"
		/>
		<path
			d="M16.54 12.37c2.24-3.65 6.39-5.76 10.39-5.4.78 4.05-.89 8.53-4.45 11.06-1.59 1.14-3.47 1.79-5.94 1.83V12.37Z"
			fill="currentColor"
			opacity="0.76"
		/>
		<path d="M16 14.56V27.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
	</svg>
);

const HumidityIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="M12.07 18.86V9.7a3.93 3.93 0 1 1 7.86 0v9.16a6.3 6.3 0 1 1-7.86 0Z"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinejoin="round"
		/>
		<path d="M16 13v10.1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
		<path d="M16 25.1a2.62 2.62 0 1 0 0-5.24 2.62 2.62 0 0 0 0 5.24Z" fill="currentColor" opacity="0.9" />
	</svg>
);

const IrrigationIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path
			d="M15.4 5.5c4.95 4.97 8.48 8.42 8.48 12.85A8.88 8.88 0 0 1 15 27.22a8.88 8.88 0 0 1-8.88-8.87c0-4.43 3.53-7.88 9.28-12.85Z"
			fill="currentColor"
			opacity="0.92"
		/>
		<path
			d="M10.72 18.95c.9-2.4 2.53-4.3 4.89-5.93"
			stroke="white"
			strokeOpacity="0.28"
			strokeWidth="2.1"
			strokeLinecap="round"
		/>
	</svg>
);

const YieldIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
		<path d="M6 6.8v18.4h19.4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
		<path d="M10.1 19.72 15.14 14h10.02" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
		<path
			d="m21.46 10.84 3.7 3.16-3.7 3.17"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const iconMap: Record<StatusCardIconName, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
	crop: CropIcon,
	humidity: HumidityIcon,
	irrigation: IrrigationIcon,
	yield: YieldIcon
};

const StatusCardIcon = ({ name, ...props }: StatusCardIconProps) => {
	const Icon = iconMap[name];
	return <Icon aria-hidden="true" focusable="false" {...props} />;
};

export default StatusCardIcon;
