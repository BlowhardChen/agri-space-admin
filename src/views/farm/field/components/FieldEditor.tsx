import { Button, Form, Input, Modal, Radio, Space } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { FarmFieldForm, FarmFieldRecord, FarmFieldType } from "@/api/interface/farmConfig";

/** 农事字段编辑弹窗属性。 */
interface FieldEditorProps {
	open: boolean;
	record?: FarmFieldRecord;
	submitting: boolean;
	onCancel: () => void;
	onSubmit: (values: FarmFieldForm) => Promise<void>;
}

/** 农事字段新增编辑弹窗，支持文本、单选和多选字段配置。 */
const FieldEditor = ({ open, record, submitting, onCancel, onSubmit }: FieldEditorProps) => {
	// 表单实例用于弹窗打开时回填字段配置。
	const [form] = Form.useForm<FarmFieldForm>();
	// 根据当前字段类型决定是否展示动态选项。
	const fieldType = Form.useWatch("farmingFieldType", form) as FarmFieldType | undefined;

	/** 提交前携带原字段标识并交给页面保存。 */
	const submit = async () => {
		const values = await form.validateFields();
		await onSubmit({ ...values, farmingFieldId: record?.farmingFieldId });
	};

	return (
		<Modal
			visible={open}
			title={`${record ? "编辑" : "新增"}农事字段`}
			width={520}
			destroyOnClose
			confirmLoading={submitting}
			onCancel={onCancel}
			onOk={() => void submit()}
			afterClose={() => form.resetFields()}
		>
			{/* 字段基础属性及可选项配置 */}
			<Form<FarmFieldForm>
				form={form}
				layout="vertical"
				preserve={false}
				initialValues={{
					farmingFieldName: record?.farmingFieldName || "",
					farmingFieldType: record?.farmingFieldType || "1",
					farmingFieldOptions: record?.farmingFieldOptions || []
				}}
			>
				<Form.Item name="farmingFieldName" label="字段名称" rules={[{ required: true, message: "请输入字段名称" }]}>
					<Input maxLength={30} placeholder="请输入" />
				</Form.Item>
				<Form.Item name="farmingFieldType" label="字段类型" rules={[{ required: true, message: "请选择字段类型" }]}>
					<Radio.Group>
						<Radio value="1">文本</Radio>
						<Radio value="2">单选</Radio>
						<Radio value="3">多选</Radio>
					</Radio.Group>
				</Form.Item>
				{fieldType !== "1" && (
					<Form.List
						name="farmingFieldOptions"
						rules={[
							{ validator: (_, value) => (value?.length ? Promise.resolve() : Promise.reject(new Error("请至少添加一个选项"))) }
						]}
					>
						{(fields, { add, remove }, { errors }) => (
							<div className="farm-field-options">
								{fields.map((field, index) => (
									<Space key={field.key} align="start" className="farm-field-option-row">
										<Form.Item name={[field.name, "farmingFieldOptionId"]} hidden>
											<Input />
										</Form.Item>
										<Form.Item
											name={[field.name, "farmingFieldOptionContent"]}
											label={`选项${index + 1}`}
											rules={[{ required: true, message: "选项不能为空" }]}
										>
											<Input maxLength={30} placeholder="请输入" />
										</Form.Item>
										<Button
											type="text"
											danger
											aria-label={`删除选项${index + 1}`}
											icon={<MinusCircleOutlined />}
											onClick={() => remove(field.name)}
										/>
									</Space>
								))}
								<Button block type="dashed" icon={<PlusOutlined />} onClick={() => add({ farmingFieldOptionContent: "" })}>
									添加选项
								</Button>
								<Form.ErrorList errors={errors} />
							</div>
						)}
					</Form.List>
				)}
			</Form>
		</Modal>
	);
};

export default FieldEditor;
