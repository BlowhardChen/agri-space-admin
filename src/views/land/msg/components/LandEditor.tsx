import { useState } from "react";
import { Alert, Col, DatePicker, Divider, Form, Input, InputNumber, Modal, Radio, Row, Select, message } from "antd";
import moment from "moment";
import type { Moment } from "moment";
import type { LandContractForm, LandRecord, VillageRecord } from "@/api/interface/land";
import { addLandContract, editLand, editLandContract } from "@/api/modules/land";
import RegionSelect from "./RegionSelect";

/** 编辑表单包含仅供日期和区域控件使用的字段。 */
interface EditorValues extends LandContractForm {
	region?: string[];
	contractDates?: [Moment, Moment];
	paymentDates?: Moment[];
}

/** 基础与合同编辑弹窗属性。 */
interface LandEditorProps {
	record: LandRecord;
	mode: "base" | "contract";
	villages: VillageRecord[];
	onClose: () => void;
	onSaved: () => void;
}

/** 完成地块基础资料或合同信息的新增、修改。 */
const LandEditor = ({ record, mode, villages, onClose, onSaved }: LandEditorProps) => {
	// 当前业务表单与重复提交保护。
	const [form] = Form.useForm<EditorValues>();
	const [saving, setSaving] = useState(false);
	// 合同表单覆盖合同信息，基础表单始终使用土地自身资料。
	const contract = mode === "contract" ? record.landContract : undefined;
	const initial = { ...record, ...contract };
	// 根据年限、亩数、租金和付款季数即时计算合同金额。
	const term = Form.useWatch("termOfLease", form) ?? initial.termOfLease ?? 0;
	const rent = Form.useWatch("perAcreAmount", form) ?? initial.perAcreAmount ?? 0;
	const acreage = Number(contract?.actualAcreNum ?? record.actualAcreNum ?? 0);
	const method = Form.useWatch("paymentMethod", form) ?? contract?.paymentMethod ?? "1";
	const total = Number((Number(rent) * acreage * Number(term)).toFixed(2));
	const payment = Number(((Number(rent) * acreage) / Number(method)).toFixed(2));

	/** 转换控件字段并调用正确的土地或合同保存接口。 */
	const save = async () => {
		// 先校验再加锁，校验失败保留所有输入。
		const values = await form.validateFields().catch(() => undefined);
		if (!values) return;
		setSaving(true);
		try {
			if (mode === "base") {
				// 基础更新只提交土地字段，避免已有合同覆盖土地 ID。
				const {
					region = [],
					landName,
					mobile,
					cardid,
					bankAccount,
					landType,
					actualAcreNum,
					administrativeVillage,
					detailaddress
				} = values;
				await editLand({
					id: record.id,
					landName: landName?.trim(),
					mobile,
					cardid,
					bankAccount,
					landType,
					actualAcreNum,
					administrativeVillage,
					detailaddress,
					province: region[0] ?? "",
					city: region[1] ?? "",
					district: region[2] ?? "",
					township: region[3] ?? "",
					landGps: record.gpsList
				});
			} else {
				// 保留源合同依赖的土地和农户字段，并单独指定合同 ID 与 landId。
				const payload: LandContractForm = {
					...contract,
					id: contract?.id,
					landId: record.id,
					landName: record.landName,
					mobile: initial.mobile,
					cardid: initial.cardid,
					bankAccount: initial.bankAccount,
					actualAcreNum: acreage,
					landType: record.landType,
					landGps: record.gpsList,
					province: initial.province,
					city: initial.city,
					district: initial.district,
					township: initial.township,
					administrativeVillage: initial.administrativeVillage,
					detailaddress: initial.detailaddress,
					termOfLease: Number(values.termOfLease),
					perAcreAmount: Number(values.perAcreAmount),
					startTime: values.contractDates?.[0].format("YYYY-MM-DD"),
					endTime: values.contractDates?.[1].format("YYYY-MM-DD"),
					paymentMethod: values.paymentMethod,
					totalAmount: total,
					paymentAmount: payment,
					times: Array.from({ length: Number(method) }, (_, index) => ({
						paymentTime: values.paymentDates![index].format("MM-DD")
					}))
				};
				await (contract ? editLandContract(payload) : addLandContract(payload));
			}
			message.success("保存成功");
			onSaved();
		} catch {
			message.error("保存失败，请检查输入或稍后重试");
		} finally {
			setSaving(false);
		}
	};

	// 基础与合同使用独立界面，切换时由父组件重新挂载。
	return (
		<Modal
			visible
			title={mode === "base" ? "修改地块信息" : contract ? "修改合同信息" : "新增合同信息"}
			width={760}
			onCancel={saving ? undefined : onClose}
			onOk={save}
			confirmLoading={saving}
			maskClosable={!saving}
			cancelButtonProps={{ disabled: saving }}
			destroyOnClose
		>
			<Form
				form={form}
				layout="vertical"
				initialValues={{
					...initial,
					region: [record.province, record.city, record.district, record.township].filter(Boolean),
					paymentMethod: contract?.paymentMethod ?? "1",
					contractDates:
						contract?.startTime && contract.endTime ? [moment(contract.startTime), moment(contract.endTime)] : undefined,
					paymentDates: contract?.times?.map(time => moment("2000-" + time.paymentTime, "YYYY-MM-DD", true))
				}}
			>
				{/* 基础资料：农户信息与土地位置 */}
				{mode === "base" ? (
					<Row gutter={24}>
						<Col span={12}>
							<Form.Item
								name="landName"
								label="农户姓名 / 地块名称"
								rules={[{ required: true, whitespace: true, message: "请输入名称" }]}
							>
								<Input maxLength={100} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="mobile" label="手机号">
								<Input maxLength={20} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="cardid" label="身份证号">
								<Input maxLength={30} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="bankAccount" label="银行卡号">
								<Input maxLength={40} />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="landType" label="土地类型" rules={[{ required: true }]}>
								<Radio.Group>
									<Radio value="1">流转</Radio>
									<Radio value="2">托管</Radio>
								</Radio.Group>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								name="actualAcreNum"
								label={"实际亩数（测量面积 " + (record.acreageNum ?? "未知") + " 亩）"}
								rules={[{ required: true, message: "请输入实际亩数" }]}
							>
								<InputNumber min={0} precision={2} style={{ width: "100%" }} />
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
							<Form.Item name="detailaddress" label="详细地址">
								<Input />
							</Form.Item>
						</Col>
					</Row>
				) : (
					<>
						{/* 合同期限、租金计算与每年付款日期 */}
						<Alert type="info" showIcon message={record.landName + " · 合同面积 " + acreage.toFixed(2) + " 亩"} />
						<Divider orientation="left">合同期限与付款信息</Divider>
						<Row gutter={24}>
							<Col span={8}>
								<Form.Item name="termOfLease" label="租赁期限（年）" rules={[{ required: true, message: "请输入租赁期限" }]}>
									<InputNumber min={0.01} precision={2} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
							<Col span={16}>
								<Form.Item name="contractDates" label="起止时间" rules={[{ required: true, message: "请选择起止时间" }]}>
									<DatePicker.RangePicker style={{ width: "100%" }} />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item name="perAcreAmount" label="每亩年租金（元）" rules={[{ required: true, message: "请输入每亩租金" }]}>
									<InputNumber min={0} precision={2} style={{ width: "100%" }} />
								</Form.Item>
							</Col>
							<Col span={12}>
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
							<Col span={12}>
								<Form.Item label="合同总金额（元）">
									<Input value={total.toFixed(2)} disabled />
								</Form.Item>
							</Col>
							<Col span={12}>
								<Form.Item label={method === "1" ? "年付款金额（元）" : "季付款金额（元）"}>
									<Input value={payment.toFixed(2)} disabled />
								</Form.Item>
							</Col>
							{Array.from({ length: Number(method) }, (_, index) => (
								<Col span={8} key={index}>
									<Form.Item
										name={["paymentDates", index]}
										label={method === "1" ? "付款日期（月-日）" : "第" + (index + 1) + "季付款日期"}
										rules={[{ required: true, message: "请选择付款日期" }]}
									>
										<DatePicker format="MM-DD" style={{ width: "100%" }} />
									</Form.Item>
								</Col>
							))}
						</Row>
					</>
				)}
			</Form>
		</Modal>
	);
};

export default LandEditor;
