import { useEffect } from "react";
import { Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import type { Moment } from "moment";
import moment from "moment";
import type { AuditForm, AuditRecord } from "@/api/interface/audit";
import type { VillageRecord } from "@/api/interface/land";
import RegionSelect from "@/views/land/msg/components/RegionSelect";

/** 审核表单在 Ant Design 控件层使用的值。 */
interface AuditEditorValues extends Omit<AuditForm, "startTime" | "endTime" | "paymentAmount" | "totalAmount" | "times"> {
	position?: string[];
	contractTerm: [Moment, Moment];
	payTime: Moment;
	payTimeTwoSeason?: Moment;
	payTimeThreeSeason?: Moment;
}

/** 审核合同弹窗属性。 */
interface AuditEditorProps {
	visible: boolean;
	record?: AuditRecord;
	villages: VillageRecord[];
	saving: boolean;
	onClose: () => void;
	onSave: (values: AuditForm) => void;
}

/** 合同期限下拉选项。 */
const CONTRACT_TERMS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(value => ({
	value,
	label: Number.isInteger(value) ? `${value} 年` : `${Math.floor(value)} 年半`.replace("0 年半", "半年")
}));

/** 将详情数据转换为带 Moment 日期的表单初始值。 */
const createFormValues = (record: AuditRecord): AuditEditorValues => {
	const startTime = record.startTime || moment().format("YYYY-MM-DD");
	const termOfLease = Number(record.termOfLease || 1);
	const endTime =
		record.endTime ||
		moment(startTime)
			.add(termOfLease * 12, "months")
			.format("YYYY-MM-DD");
	return {
		id: record.id,
		landName: record.relename || record.landName,
		mobile: record.mobile || "",
		cardid: record.cardid || "",
		bankAccount: record.bankAccount,
		actualAcreNum: record.actualAcreNum,
		position: [record.province, record.city, record.district, record.township].filter(Boolean) as string[],
		province: record.province,
		city: record.city,
		district: record.district,
		township: record.township,
		administrativeVillage: record.administrativeVillage || "",
		detailaddress: record.detailaddress,
		contractType: record.contractType || record.landType,
		termOfLease,
		contractTerm: [moment(startTime), moment(endTime)],
		perAcreAmount: Number(record.perAcreAmount || 800),
		paymentMethod: record.paymentMethod || "1",
		payTime: moment(record.times?.[0]?.paymentTime || "01-15", "MM-DD"),
		payTimeTwoSeason: record.times?.[1] ? moment(record.times[1].paymentTime, "MM-DD") : undefined,
		payTimeThreeSeason: record.times?.[2] ? moment(record.times[2].paymentTime, "MM-DD") : undefined
	};
};

/** 新增或编辑审核合同信息的业务弹窗。 */
const AuditEditor = ({ visible, record, villages, saving, onClose, onSave }: AuditEditorProps) => {
	// 保存受控审核表单实例。
	const [form] = Form.useForm<AuditEditorValues>();
	// 监听金额计算与动态付款时间字段。
	const actualAcreNum = Form.useWatch("actualAcreNum", form) || 0;
	const termOfLease = Form.useWatch("termOfLease", form) || 0;
	const perAcreAmount = Form.useWatch("perAcreAmount", form) || 0;
	const paymentMethod = Form.useWatch("paymentMethod", form) || "1";
	// 根据源页面规则计算合同总额和每次付款额。
	const totalAmount = Number((Number(actualAcreNum) * Number(termOfLease) * Number(perAcreAmount)).toFixed(2));
	const paymentCount = Number(paymentMethod);
	const paymentAmount = termOfLease ? Number((totalAmount / Number(termOfLease) / paymentCount).toFixed(2)) : 0;

	useEffect(() => {
		// 每次打开其他地块时完整替换表单，避免保留上条数据。
		if (visible && record) form.setFieldsValue(createFormValues(record));
	}, [form, record, visible]);

	/** 按合同期限联动结束日期。 */
	const updateTerm = (value: number) => {
		const current = form.getFieldValue("contractTerm");
		const start = current?.[0] || moment();
		form.setFieldsValue({ contractTerm: [start, start.clone().add(value * 12, "months")] });
	};

	/** 将控件日期与地区字段转换回审核 API 契约。 */
	const submit = (values: AuditEditorValues) => {
		const { position, contractTerm, payTime, payTimeTwoSeason, payTimeThreeSeason, ...rest } = values;
		const times = [payTime, payTimeTwoSeason, payTimeThreeSeason]
			.slice(0, Number(values.paymentMethod))
			.filter(Boolean)
			.map(value => ({ paymentTime: value!.format("MM-DD") }));
		onSave({
			...rest,
			province: position?.[0],
			city: position?.[1],
			district: position?.[2],
			township: position?.[3],
			startTime: contractTerm[0].format("YYYY-MM-DD"),
			endTime: contractTerm[1].format("YYYY-MM-DD"),
			totalAmount,
			paymentAmount,
			times
		});
	};

	// 渲染甲方、土地与合同三组审核字段。
	return (
		<Modal
			title={record?.status === "1" ? "编辑审核信息" : "合同信息"}
			visible={visible}
			width="78%"
			okText={record?.status === "1" ? "保存修改" : "完成审核"}
			cancelText="取消"
			confirmLoading={saving}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{record && (
				<Form form={form} layout="vertical" onFinish={submit} className="audit-editor-form">
					{/* 甲方信息 */}
					<h3>甲方信息</h3>
					<Row gutter={24}>
						<Col span={6}>
							<Form.Item name="landName" label="农户姓名" rules={[{ required: true, message: "请输入农户姓名" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item
								name="mobile"
								label="手机号"
								rules={[
									{ required: true, message: "请输入手机号" },
									{ pattern: /^1\d{10}$/, message: "请输入正确手机号" }
								]}
							>
								<Input />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="cardid" label="身份证号" rules={[{ required: true, message: "请输入身份证号" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="bankAccount" label="银行卡号">
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Divider />
					{/* 土地信息 */}
					<h3>土地信息</h3>
					<Row gutter={24}>
						<Col span={6}>
							<Form.Item
								name="actualAcreNum"
								label={`实测亩数（测量 ${record.acreageNum} 亩）`}
								rules={[{ required: true, message: "请输入实测亩数" }]}
							>
								<InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="position" label="地块位置" rules={[{ required: true, message: "请选择地块位置" }]}>
								<RegionSelect />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="administrativeVillage" label="行政村" rules={[{ required: true, message: "请选择行政村" }]}>
								<Select showSearch allowClear options={villages.map(item => ({ value: item.name, label: item.name }))} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="detailaddress" label="详细地址">
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Divider />
					{/* 合同信息 */}
					<h3>合同信息</h3>
					<Row gutter={24}>
						<Col span={6}>
							<Form.Item name="contractType" label="合同类型" rules={[{ required: true }]}>
								<Select
									options={[
										{ value: "1", label: "流转" },
										{ value: "2", label: "托管" }
									]}
								/>
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="termOfLease" label="合同期限" rules={[{ required: true }]}>
								<Select options={CONTRACT_TERMS} onChange={updateTerm} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="contractTerm" label="合同有效期" rules={[{ required: true }]}>
								<DatePicker.RangePicker style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="perAcreAmount" label="每亩年租金（元/亩）" rules={[{ required: true }]}>
								<InputNumber min={0} precision={2} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="paymentMethod" label="付款方式" rules={[{ required: true }]}>
								<Select
									options={[
										{ value: "1", label: "年付" },
										{ value: "2", label: "两季付" },
										{ value: "3", label: "三季付" }
									]}
								/>
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label="付款金额（年/季）">
								<InputNumber value={paymentAmount} disabled style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label="合同总金额">
								<InputNumber value={totalAmount} disabled style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item
								name="payTime"
								label={paymentMethod === "1" ? "付款时间" : "第一季付款时间"}
								rules={[{ required: true }]}
							>
								<DatePicker picker="date" format="MM-DD" style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						{paymentMethod !== "1" && (
							<Col span={6}>
								<Form.Item name="payTimeTwoSeason" label="第二季付款时间" rules={[{ required: true }]}>
									<DatePicker format="MM-DD" style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						)}
						{paymentMethod === "3" && (
							<Col span={6}>
								<Form.Item name="payTimeThreeSeason" label="第三季付款时间" rules={[{ required: true }]}>
									<DatePicker format="MM-DD" style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						)}
					</Row>
				</Form>
			)}
		</Modal>
	);
};

export default AuditEditor;
