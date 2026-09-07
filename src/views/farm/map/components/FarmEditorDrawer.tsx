import { useEffect } from "react";
import { Alert, Button, DatePicker, Drawer, Form, Input, Select, Space } from "antd";
import moment from "moment";
import type { Moment } from "moment";
import type { FarmFormOptions, FarmMapLand, FarmTaskForm, FarmTaskRecord } from "@/api/interface/farmMap";

/** 打开地图选地面板所需的上下文字段。 */
export interface FarmLandSelectorRequest {
	dictValue?: string;
	farmingTypeId?: string;
	managerId?: string;
}

/** 农事新增编辑抽屉属性。 */
interface FarmEditorDrawerProps {
	visible: boolean;
	record?: FarmTaskRecord;
	options: FarmFormOptions;
	selectedLands: FarmMapLand[];
	saving: boolean;
	onClose: () => void;
	onSelectLands: (request: FarmLandSelectorRequest) => void;
	onSave: (values: FarmTaskForm) => void;
}

/** 农事编辑器表单视图字段。 */
interface FarmEditorValues {
	farmingName: string;
	dictValue: string;
	farmingScienceId: string;
	farmingTypeId: string;
	workPeriod: [Moment, Moment];
	managerId: string;
	teamMobile: string;
}

/** 新增或编辑农事类型、周期、负责人和地块。 */
const FarmEditorDrawer = ({
	visible,
	record,
	options,
	selectedLands,
	saving,
	onClose,
	onSelectLands,
	onSave
}: FarmEditorDrawerProps) => {
	// 创建抽屉独立使用的农事表单。
	const [form] = Form.useForm<FarmEditorValues>();
	// 读取当前作物以联动技术标准和农事类型。
	const cropValue = Form.useWatch("dictValue", form);
	// 当前作物对应的技术标准。
	const standardOptions = options.standards.filter(item => !cropValue || item.parentValue === cropValue);
	// 当前作物对应的农事类型。
	const farmingTypeOptions = options.farmingTypes.filter(item => !cropValue || item.parentValue === cropValue);
	// 汇总当前选择的全部地块面积。
	const selectedArea = Number(selectedLands.reduce((sum, land) => sum + land.actualAcreNum, 0).toFixed(2));
	// 汇总流转地块面积。
	const transferArea = Number(
		selectedLands
			.filter(land => land.landType === "1")
			.reduce((sum, land) => sum + land.actualAcreNum, 0)
			.toFixed(2)
	);
	// 汇总托管地块面积。
	const managedArea = Number(
		selectedLands
			.filter(land => land.landType === "2")
			.reduce((sum, land) => sum + land.actualAcreNum, 0)
			.toFixed(2)
	);

	useEffect(() => {
		// 打开时回显任务，新增时设置空表单。
		if (!visible) return;
		form.setFieldsValue({
			farmingName: record?.farmingName,
			dictValue: record?.dictValue,
			farmingScienceId: record?.farmingScienceId,
			farmingTypeId: record?.farmingTypeId,
			workPeriod: record ? [moment(record.workBeginTime), moment(record.workEndTime)] : undefined,
			managerId: record?.managerId,
			teamMobile: record?.teamMobile
		});
	}, [form, record, visible]);

	/** 打开地图选地前校验区域经理。 */
	const chooseLands = () => {
		// 读取决定可选地块范围的当前表单字段。
		const values = form.getFieldsValue(["dictValue", "farmingTypeId", "managerId"]);
		if (!values.managerId) {
			void form.validateFields(["managerId"]);
			return;
		}
		onSelectLands(values);
	};

	/** 校验并转换农事提交字段。 */
	const submit = (values: FarmEditorValues) => {
		if (!selectedLands.length) return;
		onSave({
			farmingId: record?.farmingId,
			farmingName: values.farmingName,
			dictValue: values.dictValue,
			farmingScienceId: values.farmingScienceId,
			farmingTypeId: values.farmingTypeId,
			workBeginTime: values.workPeriod[0].format("YYYY-MM-DD"),
			workEndTime: values.workPeriod[1].format("YYYY-MM-DD"),
			managerId: values.managerId,
			teamMobile: values.teamMobile,
			landIds: selectedLands.map(land => land.id)
		});
	};

	// 渲染农事编辑表单和固定操作区。
	return (
		<Drawer
			title={record ? "编辑农事" : "新增农事"}
			visible={visible}
			width={430}
			onClose={onClose}
			extra={
				<Space>
					<Button onClick={onClose}>取消</Button>
					<Button type="primary" loading={saving} onClick={() => form.submit()}>
						确定
					</Button>
				</Space>
			}
			destroyOnClose
		>
			<Form form={form} layout="vertical" onFinish={submit}>
				{/* 农事类型与技术标准 */}
				<div className="farm-form-section-title">农事类型</div>
				<Form.Item
					name="farmingName"
					label="农事名称"
					rules={[
						{ required: true, message: "请输入农事名称" },
						{ max: 40, message: "最多输入 40 个字符" }
					]}
				>
					<Input placeholder="请输入" />
				</Form.Item>
				<Form.Item name="dictValue" label="作物类型" rules={[{ required: true, message: "请选择作物类型" }]}>
					<Select
						allowClear
						options={options.crops}
						placeholder="请选择"
						onChange={() => form.setFieldsValue({ farmingScienceId: undefined, farmingTypeId: undefined })}
					/>
				</Form.Item>
				<Form.Item name="farmingScienceId" label="技术标准" rules={[{ required: true, message: "请选择技术标准" }]}>
					<Select allowClear disabled={!cropValue} options={standardOptions} placeholder="请选择" />
				</Form.Item>
				<Form.Item name="farmingTypeId" label="农事类型" rules={[{ required: true, message: "请选择农事类型" }]}>
					<Select allowClear disabled={!cropValue} options={farmingTypeOptions} placeholder="请选择" />
				</Form.Item>
				<Form.Item name="workPeriod" label="作业周期" rules={[{ required: true, message: "请选择作业周期" }]}>
					<DatePicker.RangePicker style={{ width: "100%" }} />
				</Form.Item>
				<Form.Item name="managerId" label="区域经理" rules={[{ required: true, message: "请选择区域经理" }]}>
					<Select allowClear options={options.managers} placeholder="请选择" />
				</Form.Item>
				{/* 地图地块选择摘要 */}
				<Form.Item label="农事地块" required>
					<button type="button" className="farm-land-select-trigger" onClick={chooseLands}>
						{selectedLands.length ? (
							<>
								已选择 <strong>{selectedLands.length}</strong> 块，共 <strong>{selectedArea}</strong> 亩
							</>
						) : (
							"请选择农事地块"
						)}
						<span>›</span>
					</button>
					{!selectedLands.length && <div className="farm-form-error">请选择农事地块</div>}
				</Form.Item>
				{selectedLands.length > 0 && (
					<Alert
						type="success"
						showIcon
						message={`实际亩数 ${selectedArea} 亩，流转 ${transferArea} 亩，托管 ${managedArea} 亩`}
					/>
				)}
				{/* 机耕队分配 */}
				<div className="farm-form-section-title is-team">分配机耕队</div>
				<Form.Item name="teamMobile" label="机耕队长账号" rules={[{ required: true, message: "请输入机耕队长账号" }]}>
					<Input placeholder="请输入手机号" />
				</Form.Item>
			</Form>
		</Drawer>
	);
};

export default FarmEditorDrawer;
