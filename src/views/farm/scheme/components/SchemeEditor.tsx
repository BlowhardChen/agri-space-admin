import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, Modal, Radio, Row, Select, Space, Upload, message } from "antd";
import { CheckOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import type {
	FarmCropValue,
	FarmSchemeForm,
	FarmSchemeRecord,
	FarmSchemeTypeValue,
	FarmTypeRecord
} from "@/api/interface/farmConfig";
import { FARM_CROP_OPTIONS, getFarmTypeList } from "@/api/modules/farmConfig";

/** 方案基础信息表单值。 */
interface SchemeBaseValues {
	farmingScienceName: string;
	dictValue: FarmCropValue;
	status: "0" | "1";
	remark?: string;
}

/** 动态字段值以农事类型和字段标识两级索引保存。 */
type SchemeFieldValues = Record<string, Record<string, string | string[] | undefined>>;

/** 农技方案编辑弹窗属性。 */
interface SchemeEditorProps {
	open: boolean;
	record?: FarmSchemeRecord;
	submitting: boolean;
	onCancel: () => void;
	onSubmit: (values: FarmSchemeForm) => Promise<void>;
}

/** 把已保存方案转换为动态表单值。 */
const createFieldValues = (record?: FarmSchemeRecord): SchemeFieldValues => {
	// 按类型聚合字段值，方便控件读写。
	const values: SchemeFieldValues = {};
	record?.farmingScienceTypes.forEach(type => {
		values[type.farmingTypeId] = {};
		type.fields.forEach(field => {
			values[type.farmingTypeId][field.farmingFieldId] = field.farmingFieldType === "3" ? field.values : field.values[0];
		});
	});
	return values;
};

/** 农技方案新增编辑弹窗，按作物加载农事类型并动态生成字段。 */
const SchemeEditor = ({ open, record, submitting, onCancel, onSubmit }: SchemeEditorProps) => {
	// 基础信息由 Ant Design Form 管理。
	const [form] = Form.useForm<SchemeBaseValues>();
	// 方案具体内容由类型列表、选择项和动态字段值构成。
	const [types, setTypes] = useState<FarmTypeRecord[]>([]);
	const [selectedTypeIds, setSelectedTypeIds] = useState<string[]>([]);
	const [fieldValues, setFieldValues] = useState<SchemeFieldValues>({});
	const [attachmentName, setAttachmentName] = useState<string>();
	const [attachmentUrl, setAttachmentUrl] = useState<string>();
	const [loadingTypes, setLoadingTypes] = useState(false);

	/** 读取指定作物的农事类型。 */
	const loadTypes = async (crop: FarmCropValue) => {
		setLoadingTypes(true);
		try {
			const response = await getFarmTypeList({ dictValue: crop, pageNum: 1, pageSize: 200 });
			setTypes(response.data?.rows || []);
		} catch {
			setTypes([]);
			message.error("农事类型加载失败，请重试");
		} finally {
			setLoadingTypes(false);
		}
	};

	useEffect(() => {
		if (!open) return;
		// 每次打开弹窗都重新读取关联类型，保证跨页面 Mock 修改能够生效。
		const crop = record?.dictValue || "wheat";
		form.setFieldsValue({
			farmingScienceName: record?.farmingScienceName || "",
			dictValue: crop,
			status: record?.status || "1",
			remark: record?.remark || ""
		});
		setSelectedTypeIds(record?.farmingScienceTypes.map(type => type.farmingTypeId) || []);
		setFieldValues(createFieldValues(record));
		setAttachmentName(record?.attachmentName);
		setAttachmentUrl(record?.attachmentUrl);
		void loadTypes(crop);
	}, [form, open, record]);

	/** 切换作物后清空原作物的类型和字段配置。 */
	const changeCrop = (crop: FarmCropValue) => {
		setSelectedTypeIds([]);
		setFieldValues({});
		void loadTypes(crop);
	};

	/** 添加或取消一个农事类型。 */
	const toggleType = (typeId: string) => {
		setSelectedTypeIds(current => (current.includes(typeId) ? current.filter(item => item !== typeId) : [...current, typeId]));
	};

	/** 更新一个方案动态字段的值。 */
	const updateFieldValue = (typeId: string, fieldId: string, value: string | string[]) => {
		setFieldValues(current => ({ ...current, [typeId]: { ...current[typeId], [fieldId]: value } }));
	};

	/** 本地 Mock 仅记录附件名称和虚拟地址，不发起上传请求。 */
	const beforeUpload: UploadProps["beforeUpload"] = file => {
		setAttachmentName(file.name);
		setAttachmentUrl(`mock://${file.name}`);
		return false;
	};

	/** 把已选择类型和动态值组装为方案接口模型。 */
	const createSchemeTypes = (): FarmSchemeTypeValue[] =>
		types
			.filter(type => selectedTypeIds.includes(type.farmingTypeId))
			.map(type => ({
				farmingTypeId: type.farmingTypeId,
				farmingTypeName: type.farmingTypeName,
				fields: type.farmingFields.map(field => {
					// 文本和单选值统一转成数组，多选保留原数组。
					const value = fieldValues[type.farmingTypeId]?.[field.farmingFieldId];
					const values = Array.isArray(value) ? value : value == null || value === "" ? [] : [String(value)];
					return {
						farmingFieldId: field.farmingFieldId,
						farmingFieldName: field.farmingFieldName,
						farmingFieldType: field.farmingFieldType,
						values
					};
				})
			}));

	/** 校验方案基础信息和类型选择后提交。 */
	const submit = async () => {
		const values = await form.validateFields();
		if (!selectedTypeIds.length) {
			message.warning("请至少选择一个农事类型");
			return;
		}
		await onSubmit({
			...values,
			farmingScienceId: record?.farmingScienceId,
			attachmentName,
			attachmentUrl,
			farmingScienceTypes: createSchemeTypes()
		});
	};

	// 当前选中的完整农事类型用于渲染动态字段区。
	const selectedTypes = types.filter(type => selectedTypeIds.includes(type.farmingTypeId));

	return (
		<Modal
			visible={open}
			title={`${record ? "编辑" : "新增"}农技方案`}
			width={980}
			className="farm-scheme-editor"
			destroyOnClose
			confirmLoading={submitting}
			onCancel={onCancel}
			onOk={() => void submit()}
			afterClose={() => form.resetFields()}
		>
			<Form<SchemeBaseValues> form={form} layout="vertical" preserve={false}>
				{/* 方案基础资料 */}
				<div className="farm-scheme-section-title">基础信息</div>
				<Row gutter={18}>
					<Col span={8}>
						<Form.Item name="farmingScienceName" label="方案名称" rules={[{ required: true, message: "请输入方案名称" }]}>
							<Input maxLength={40} placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name="dictValue" label="农事作物" rules={[{ required: true, message: "请选择农事作物" }]}>
							<Select options={[...FARM_CROP_OPTIONS]} placeholder="请选择" onChange={changeCrop} />
						</Form.Item>
					</Col>
					<Col span={8}>
						<Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
							<Radio.Group>
								<Radio value="1">启用</Radio>
								<Radio value="0">禁用</Radio>
							</Radio.Group>
						</Form.Item>
					</Col>
				</Row>
				<Row gutter={18}>
					<Col span={8}>
						<Form.Item label="附件" extra="支持 png、jpg、xls、xlsx、pdf">
							{attachmentName ? (
								<Space>
									<span>{attachmentName}</span>
									<Button
										type="text"
										danger
										aria-label="删除附件"
										icon={<DeleteOutlined />}
										onClick={() => {
											setAttachmentName(undefined);
											setAttachmentUrl(undefined);
										}}
									/>
								</Space>
							) : (
								<Upload accept=".png,.jpg,.jpeg,.xls,.xlsx,.pdf" showUploadList={false} beforeUpload={beforeUpload}>
									<Button icon={<UploadOutlined />}>添加附件</Button>
								</Upload>
							)}
						</Form.Item>
					</Col>
					<Col span={16}>
						<Form.Item name="remark" label="备注">
							<Input maxLength={100} placeholder="请输入" />
						</Form.Item>
					</Col>
				</Row>
			</Form>

			{/* 农事类型及动态字段配置 */}
			<div className="farm-scheme-section-title">具体方案</div>
			<div className="farm-config-editor-label">农事类型</div>
			<div className="farm-scheme-type-list">
				{types.map(type => {
					// 选中态使用主题色按钮，禁用类型仍展示但不可新增选择。
					const selected = selectedTypeIds.includes(type.farmingTypeId);
					return (
						<Button
							key={type.farmingTypeId}
							className="farm-scheme-type-button"
							type={selected ? "primary" : "default"}
							disabled={!selected && type.status === "0"}
							icon={selected ? <CheckOutlined /> : undefined}
							onClick={() => toggleType(type.farmingTypeId)}
						>
							{type.farmingTypeName}
						</Button>
					);
				})}
				{!loadingTypes && !types.length && <span>当前作物暂无农事类型</span>}
			</div>
			{selectedTypes.length ? (
				selectedTypes.map(type => (
					<Card key={type.farmingTypeId} size="small" title={type.farmingTypeName} className="farm-scheme-type-card">
						<Row gutter={18}>
							{type.farmingFields.map(field => {
								// 根据字段类型选择对应输入控件。
								const value = fieldValues[type.farmingTypeId]?.[field.farmingFieldId];
								const options = field.farmingFieldOptions.map(item => ({
									label: item.farmingFieldOptionContent,
									value: item.farmingFieldOptionId
								}));
								return (
									<Col key={field.farmingFieldId} span={8}>
										<Form.Item label={field.farmingFieldName}>
											{field.farmingFieldType === "1" ? (
												<Input
													value={typeof value === "string" ? value : undefined}
													placeholder="请输入"
													onChange={event => updateFieldValue(type.farmingTypeId, field.farmingFieldId, event.target.value)}
												/>
											) : (
												<Select
													value={value}
													mode={field.farmingFieldType === "3" ? "multiple" : undefined}
													allowClear
													maxTagCount="responsive"
													options={options}
													placeholder="请选择"
													onChange={nextValue => updateFieldValue(type.farmingTypeId, field.farmingFieldId, nextValue)}
												/>
											)}
										</Form.Item>
									</Col>
								);
							})}
						</Row>
					</Card>
				))
			) : (
				<div className="farm-scheme-empty">请选择农事类型后配置具体方案</div>
			)}
		</Modal>
	);
};

export default SchemeEditor;
