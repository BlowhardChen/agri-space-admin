import { useEffect } from "react";
import { Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, Button } from "antd";
import type { Moment } from "moment";
import type { FarmFormOptions, FarmTaskListParams, FarmWorkStatus } from "@/api/interface/farmMap";

/** 高级筛选抽屉属性。 */
interface FarmFilterDrawerProps {
	visible: boolean;
	filters: FarmTaskListParams;
	options: FarmFormOptions;
	onClose: () => void;
	onApply: (filters: FarmTaskListParams) => void;
}

/** 高级筛选表单视图字段。 */
interface FarmFilterValues {
	dictValue?: string;
	farmingTypeId?: string;
	workStatus?: FarmWorkStatus;
	createBy?: string;
	createTime?: [Moment, Moment];
	teamMobile?: string;
	mobile?: string;
	beginTotalArea?: number;
	endsTotalArea?: number;
	workBeginArea?: number;
	workEndArea?: number;
}

/** 收集作物、农事类型、人员、时间和面积筛选。 */
const FarmFilterDrawer = ({ visible, filters, options, onClose, onApply }: FarmFilterDrawerProps) => {
	// 创建高级筛选独立表单。
	const [form] = Form.useForm<FarmFilterValues>();
	// 读取当前选择的作物，用于过滤农事类型。
	const cropValue = Form.useWatch("dictValue", form);
	// 当前作物可用的农事类型。
	const farmingTypeOptions = options.farmingTypes.filter(item => !cropValue || item.parentValue === cropValue);

	useEffect(() => {
		// 打开抽屉时回显除关键字外的已应用筛选值。
		if (!visible) return;
		form.setFieldsValue({
			dictValue: filters.dictValue,
			farmingTypeId: filters.farmingTypeId,
			workStatus: filters.workStatus || undefined,
			createBy: filters.createBy,
			teamMobile: filters.teamMobile,
			mobile: filters.mobile,
			beginTotalArea: filters.beginTotalArea,
			endsTotalArea: filters.endsTotalArea,
			workBeginArea: filters.workBeginArea,
			workEndArea: filters.workEndArea
		});
	}, [filters, form, visible]);

	/** 格式化日期范围并应用高级筛选。 */
	const submit = (values: FarmFilterValues) => {
		// 从视图字段中拆出需要格式化的创建时间。
		const { createTime, ...rest } = values;
		onApply({
			...rest,
			createBeginTime: createTime?.[0]?.format("YYYY-MM-DD"),
			createEndTime: createTime?.[1]?.format("YYYY-MM-DD")
		});
	};

	/** 清空高级筛选但保留外部关键字。 */
	const reset = () => {
		form.resetFields();
		onApply({});
	};

	// 渲染高级筛选表单与底部操作区。
	return (
		<Drawer
			title="更多筛选"
			visible={visible}
			width={460}
			onClose={onClose}
			extra={
				<Space>
					<Button onClick={reset}>重置</Button>
					<Button type="primary" onClick={() => form.submit()}>
						确定
					</Button>
				</Space>
			}
			destroyOnClose
		>
			{/* 作物、类型、状态和创建信息 */}
			<Form form={form} layout="vertical" onFinish={submit}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="dictValue" label="农事作物">
							<Select
								allowClear
								options={options.crops}
								placeholder="请选择"
								onChange={() => form.setFieldsValue({ farmingTypeId: undefined })}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="farmingTypeId" label="农事类型">
							<Select allowClear disabled={!cropValue} options={farmingTypeOptions} placeholder="请选择" />
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="workStatus" label="作业状态">
							<Select
								allowClear
								options={[
									{ value: "1", label: "作业中" },
									{ value: "2", label: "已完成" }
								]}
								placeholder="请选择"
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="createBy" label="创建人">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
				</Row>
				<Form.Item name="createTime" label="创建时间">
					<DatePicker.RangePicker style={{ width: "100%" }} />
				</Form.Item>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="teamMobile" label="机耕队长">
							<Input allowClear placeholder="请输入姓名或手机号" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="mobile" label="区域经理">
							<Input allowClear placeholder="请输入姓名或手机号" />
						</Form.Item>
					</Col>
				</Row>
				{/* 任务总面积和已作业面积范围 */}
				<div className="farm-filter-range-label">农事面积（亩）</div>
				<div className="farm-filter-range">
					<Form.Item name="beginTotalArea" noStyle>
						<InputNumber min={0} placeholder="最小面积" />
					</Form.Item>
					<span>~</span>
					<Form.Item name="endsTotalArea" noStyle>
						<InputNumber min={0} placeholder="最大面积" />
					</Form.Item>
				</div>
				<div className="farm-filter-range-label">作业面积（亩）</div>
				<div className="farm-filter-range">
					<Form.Item name="workBeginArea" noStyle>
						<InputNumber min={0} placeholder="最小面积" />
					</Form.Item>
					<span>~</span>
					<Form.Item name="workEndArea" noStyle>
						<InputNumber min={0} placeholder="最大面积" />
					</Form.Item>
				</div>
			</Form>
		</Drawer>
	);
};

export default FarmFilterDrawer;
