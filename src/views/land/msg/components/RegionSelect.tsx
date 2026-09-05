import { useEffect, useState } from "react";
import { Cascader, message } from "antd";

/** 地约行政区划树，值为后端使用的中文区划名称。 */
interface RegionOption {
	label: string;
	value: string;
	children?: RegionOption[];
}

/** 地块位置级联选择器属性。 */
interface RegionSelectProps {
	id?: string;
	value?: string[];
	onChange?: (value: string[]) => void;
}

/** 按需加载四级区划数据，避免登录页提前下载大型静态资源。 */
const RegionSelect = ({ id, value, onChange }: RegionSelectProps) => {
	// 缓存当前组件所需的区划选项。
	const [options, setOptions] = useState<RegionOption[]>([]);
	useEffect(() => {
		// 防止组件卸载后异步资源加载回写状态。
		let active = true;
		import("@/assets/json/landRegions.json")
			.then(data => {
				if (active) setOptions(data.default);
			})
			.catch(() => {
				if (active) message.error("行政区划加载失败，请刷新页面重试");
			});
		return () => {
			active = false;
		};
	}, []);
	// 地区可选到省、市、区或乡镇，保留源系统字符串值。
	return (
		<Cascader
			id={id}
			value={value}
			options={options}
			onChange={values => onChange?.(values.map(String))}
			changeOnSelect
			showSearch
			allowClear
			placeholder="选择省 / 市 / 区 / 乡镇"
			style={{ width: "100%" }}
		/>
	);
};

export default RegionSelect;
