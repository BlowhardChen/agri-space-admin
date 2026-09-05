import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space } from "antd";
import moment from "moment";
import type { Moment } from "moment";
import type { LandListParams, VillageRecord } from "@/api/interface/land";
import RegionSelect from "./RegionSelect";

/** 高级筛选界面的日期与区划字段。 */
interface FilterValues extends LandListParams {
	region?: string[];
	uploadDates?: [Moment, Moment];
}

/** 高级筛选抽屉由页面维护已应用条件。 */
interface FilterDrawerProps {
	value: LandListParams;
	villages: VillageRecord[];
	onClose: () => void;
	onApply: (value: LandListParams) => void;
}

/** 农户、合同、区域、面积和上传日期的高级筛选。 */
const FilterDrawer = ({ value, villages, onClose, onApply }: FilterDrawerProps) => {
	// 独立表单保证取消不会修改已经生效的查询条件。
	const [form] = Form.useForm<FilterValues>();
	/** 重置为不限制任何条件，而不是恢复上次已应用的条件。 */
	const reset = () => {
		form.setFields(Object.keys(form.getFieldsValue()).map(name => ({ name, value: undefined, errors: [] })));
	};
	/** 校验范围并转换为源后端筛选契约。 */
	const apply = async () => {
		// 只把业务字段传给接口，剔除日期对象和级联控件值。
		const values = await form.validateFields().catch(() => undefined);
		if (!values) return;
		const { region = [], uploadDates, ...fields } = values;
		onApply({
			...fields,
			province: region[0],
			city: region[1],
			district: region[2],
			township: region[3],
			beginTime: uploadDates?.[0].format("YYYY-MM-DD"),
			endsTime: uploadDates?.[1].format("YYYY-MM-DD")
		});
	};
	// 双列表单覆盖源页面全部高级筛选项。
	return (
		<Drawer
			visible
			title="筛选地块"
			width={560}
			onClose={onClose}
			footer={
				<Space>
					<Button onClick={reset}>重置</Button>
					<Button onClick={onClose}>取消</Button>
					<Button type="primary" onClick={apply}>
						应用筛选
					</Button>
				</Space>
			}
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					...value,
					region: [value.province, value.city, value.district, value.township].filter(Boolean),
					uploadDates: value.beginTime && value.endsTime ? [moment(value.beginTime), moment(value.endsTime)] : undefined
				}}
			>
				{/* 农户身份与联系方式 */}
				<Row gutter={20}>
					{(
						[
							{ name: "cardid", label: "身份证号" },
							{ name: "bankAccount", label: "银行卡号" },
							{ name: "relename", label: "农户姓名" },
							{ name: "mobile", label: "手机号" },
							{ name: "areaManager", label: "区域经理" }
						] as const
					).map(field => (
						<Col span={12} key={field.name}>
							<Form.Item name={field.name} label={field.label}>
								<Input allowClear />
							</Form.Item>
						</Col>
					))}
					<Col span={12}>
						<Form.Item name="contractType" label="合同类型">
							<Select
								allowClear
								options={[
									{ value: "1", label: "流转" },
									{ value: "2", label: "托管" }
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="region" label="地块位置">
							<RegionSelect />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="administrativeVillage" label="行政村">
							<Select allowClear showSearch options={villages.map(village => ({ value: village.name, label: village.name }))} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="landType" label="地块类型">
							<Select
								allowClear
								options={[
									{ value: "1", label: "流转" },
									{ value: "2", label: "托管" }
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="beginActualNum" label="最小亩数">
							<InputNumber min={0} precision={2} style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="endActualNum"
							label="最大亩数"
							dependencies={["beginActualNum"]}
							rules={[
								{
									validator: (_, end) =>
										end != null && form.getFieldValue("beginActualNum") > end
											? Promise.reject(new Error("最大亩数不能小于最小亩数"))
											: Promise.resolve()
								}
							]}
						>
							<InputNumber min={0} precision={2} style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="uploadDates" label="上传时间">
							<DatePicker.RangePicker style={{ width: "100%" }} />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="detailaddress" label="详细地址">
							<Input allowClear />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Drawer>
	);
};

export default FilterDrawer;
