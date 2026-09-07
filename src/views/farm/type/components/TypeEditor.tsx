import { useEffect, useState } from "react";
import { Form, Input, Modal, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { FarmCropValue, FarmFieldRecord, FarmTypeForm, FarmTypeRecord } from "@/api/interface/farmConfig";
import { getFarmFieldList } from "@/api/modules/farmConfig";

/** 农事类型编辑弹窗属性。 */
interface TypeEditorProps {
	open: boolean;
	crop: FarmCropValue;
	record?: FarmTypeRecord;
	submitting: boolean;
	onCancel: () => void;
	onSubmit: (values: FarmTypeForm) => Promise<void>;
}

/** 农事字段类型展示配置。 */
const FIELD_TYPE_META = {
	"1": { color: "blue", text: "文本" },
	"2": { color: "green", text: "单选" },
	"3": { color: "purple", text: "多选" }
} as const;

/** 农事类型编辑弹窗，关联启用中的农事字段。 */
const TypeEditor = ({ open, crop, record, submitting, onCancel, onSubmit }: TypeEditorProps) => {
	// 表单实例管理类型名称。
	const [form] = Form.useForm<Pick<FarmTypeForm, "farmingTypeName">>();
	// 弹窗内维护可关联字段、勾选结果和加载状态。
	const [fields, setFields] = useState<FarmFieldRecord[]>([]);
	const [selectedFieldIds, setSelectedFieldIds] = useState<React.Key[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) return;
		// 每次打开都读取最新字段，确保字段页面的变更即时生效。
		setLoading(true);
		void getFarmFieldList({ status: "1", pageNum: 1, pageSize: 200 })
			.then(response => setFields(response.data?.rows || []))
			.catch(() => message.error("农事字段加载失败，请重试"))
			.finally(() => setLoading(false));
		setSelectedFieldIds(record?.farmingFields.map(field => field.farmingFieldId) || []);
		form.setFieldsValue({ farmingTypeName: record?.farmingTypeName || "" });
	}, [form, open, record]);

	/** 校验名称和关联字段后提交类型配置。 */
	const submit = async () => {
		const values = await form.validateFields();
		if (!selectedFieldIds.length) {
			message.warning("请至少关联一个农事字段");
			return;
		}
		await onSubmit({
			...values,
			farmingTypeId: record?.farmingTypeId,
			dictValue: crop,
			farmingFieldIds: selectedFieldIds.map(String)
		});
	};

	// 字段表格展示名称和控件类型。
	const columns: ColumnsType<FarmFieldRecord> = [
		{ title: "字段", dataIndex: "farmingFieldName" },
		{
			title: "类型",
			dataIndex: "farmingFieldType",
			width: 130,
			render: value => {
				// 将字段编码映射为可读标签。
				const meta = FIELD_TYPE_META[value as keyof typeof FIELD_TYPE_META];
				return <Tag color={meta.color}>{meta.text}</Tag>;
			}
		}
	];

	return (
		<Modal
			visible={open}
			title={`${record ? "编辑" : "新增"}农事类型`}
			width={720}
			destroyOnClose
			confirmLoading={submitting}
			onCancel={onCancel}
			onOk={() => void submit()}
		>
			{/* 农事类型名称 */}
			<Form form={form} layout="vertical" preserve={false}>
				<Form.Item name="farmingTypeName" label="农事类型" rules={[{ required: true, message: "请输入类型名称" }]}>
					<Input maxLength={30} placeholder="请输入" />
				</Form.Item>
			</Form>
			{/* 可关联的启用字段 */}
			<div className="farm-config-editor-label">关联字段</div>
			<Table<FarmFieldRecord>
				rowKey="farmingFieldId"
				size="small"
				loading={loading}
				columns={columns}
				dataSource={fields}
				pagination={false}
				scroll={{ y: 310 }}
				rowSelection={{ selectedRowKeys: selectedFieldIds, onChange: keys => setSelectedFieldIds(keys) }}
			/>
		</Modal>
	);
};

export default TypeEditor;
