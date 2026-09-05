import { useEffect } from "react";
import { Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Row, Select } from "antd";
import moment from "moment";
import type { Moment } from "moment";
import type { ContractForm, ContractRecord } from "@/api/interface/contract";
import RegionSelect from "@/views/land/msg/components/RegionSelect";

/** 合同编辑表单在控件层使用的日期和地区字段。 */
interface ContractEditorValues extends Omit<ContractForm, "startTime" | "endTime" | "paymentAmount" | "totalAmount" | "times"> {
	position?: string[];
	contractTerm: [Moment, Moment];
	payTime: Moment;
	payTimeTwoSeason?: Moment;
	payTimeThreeSeason?: Moment;
}

/** 合同编辑弹窗属性。 */
interface ContractEditorProps {
	visible: boolean;
	record?: ContractRecord;
	saving: boolean;
	onClose: () => void;
	onSave: (values: ContractForm) => void;
}

/** 合同期限候选项。 */
const CONTRACT_TERMS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(value => ({
	value,
	label: value === 0.5 ? "半年" : Number.isInteger(value) ? `${value} 年` : `${Math.floor(value)} 年半`
}));

/** 将合同详情转换为 Ant Design 表单值。 */
const createFormValues = (record: ContractRecord): ContractEditorValues => ({
	...record,
	position: [record.province, record.city, record.district, record.township].filter(Boolean) as string[],
	contractTerm: [moment(record.startTime), moment(record.endTime)],
	payTime: moment(record.times[0]?.paymentTime || "01-15", "MM-DD"),
	payTimeTwoSeason: record.times[1] ? moment(record.times[1].paymentTime, "MM-DD") : undefined,
	payTimeThreeSeason: record.times[2] ? moment(record.times[2].paymentTime, "MM-DD") : undefined
});

/** 编辑甲乙双方、土地及付款信息的合同弹窗。 */
const ContractEditor = ({ visible, record, saving, onClose, onSave }: ContractEditorProps) => {
	// 保存合同表单实例和参与金额计算的动态字段。
	const [form] = Form.useForm<ContractEditorValues>();
	const actualAcreNum = Form.useWatch("actualAcreNum", form) || 0;
	const termOfLease = Form.useWatch("termOfLease", form) || 0;
	const perAcreAmount = Form.useWatch("perAcreAmount", form) || 0;
	const paymentMethod = Form.useWatch("paymentMethod", form) || "1";
	// 按源系统规则派生合同总金额和年付或季付金额。
	const totalAmount = Number((Number(actualAcreNum) * Number(termOfLease) * Number(perAcreAmount)).toFixed(2));
	const paymentAmount = termOfLease ? Number((totalAmount / Number(termOfLease) / Number(paymentMethod)).toFixed(2)) : 0;

	useEffect(() => {
		// 切换编辑对象时完整覆盖旧表单数据。
		if (visible && record) form.setFieldsValue(createFormValues(record));
	}, [form, record, visible]);

	/** 合同期限变化时根据开始日顺推结束日。 */
	const updateTerm = (value: number) => {
		const current = form.getFieldValue("contractTerm");
		const start = current?.[0] || moment();
		form.setFieldsValue({ contractTerm: [start, start.clone().add(value * 12, "months")] });
	};

	/** 把控件临时字段转换为合同保存模型。 */
	const submit = (values: ContractEditorValues) => {
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
			paymentAmount,
			totalAmount,
			times
		});
	};

	// 渲染合同编辑的四个业务区块。
	return (
		<Modal
			title="编辑合同信息"
			visible={visible}
			width="76%"
			okText="保存"
			cancelText="取消"
			confirmLoading={saving}
			onCancel={onClose}
			onOk={() => form.submit()}
			destroyOnClose
		>
			{record && (
				<Form form={form} layout="vertical" onFinish={submit} className="contract-editor-form">
					{/* 甲方信息 */}
					<h3>甲方信息</h3>
					<Row gutter={20}>
						<Col span={6}>
							<Form.Item name="relename" label="农户姓名" rules={[{ required: true, message: "请输入农户姓名" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="mobile" label="手机号" rules={[{ required: true, message: "请输入手机号" }]}>
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
					{/* 乙方信息 */}
					<h3>乙方信息</h3>
					<Row gutter={20}>
						<Col span={8}>
							<Form.Item name="tenantryName" label="承租方" rules={[{ required: true, message: "请输入承租方" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name="tenantryMobile" label="联系电话" rules={[{ required: true, message: "请输入联系电话" }]}>
								<Input />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name="tenantryAddress" label="联系地址" rules={[{ required: true, message: "请输入联系地址" }]}>
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Divider />
					{/* 土地信息 */}
					<h3>土地信息</h3>
					<Row gutter={20}>
						<Col span={6}>
							<Form.Item name="actualAcreNum" label={`实际亩数（测量 ${record.acreageNum} 亩）`} rules={[{ required: true }]}>
								<InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item name="position" label="地块位置" rules={[{ required: true }]}>
								<RegionSelect />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="detailaddress" label="详细地址">
								<Input />
							</Form.Item>
						</Col>
					</Row>
					<Divider />
					{/* 合同和付款信息 */}
					<h3>合同信息</h3>
					<Row gutter={20}>
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
							<Form.Item name="perAcreAmount" label="每亩租金（元/亩）" rules={[{ required: true }]}>
								<InputNumber min={0} precision={2} style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label="付款金额">
								<InputNumber value={paymentAmount} disabled style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						<Col span={6}>
							<Form.Item label="合同总金额">
								<InputNumber value={totalAmount} disabled style={{ width: "100%" }} />
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
							<Form.Item name="payTime" label={paymentMethod === "1" ? "付款时间" : "第一季时间"} rules={[{ required: true }]}>
								<DatePicker format="MM-DD" style={{ width: "100%" }} />
							</Form.Item>
						</Col>
						{paymentMethod !== "1" && (
							<Col span={6}>
								<Form.Item name="payTimeTwoSeason" label="第二季时间" rules={[{ required: true }]}>
									<DatePicker format="MM-DD" style={{ width: "100%" }} />
								</Form.Item>
							</Col>
						)}
						{paymentMethod === "3" && (
							<Col span={6}>
								<Form.Item name="payTimeThreeSeason" label="第三季时间" rules={[{ required: true }]}>
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

export default ContractEditor;
