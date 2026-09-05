import { useEffect, useState } from "react";
import { Form, Input, Modal, Radio, message } from "antd";
import type { VillageForm, VillageRecord } from "@/api/interface/land";
import { addVillage, editVillage } from "@/api/modules/land";

/** 行政村编辑弹窗的显示和保存回调属性。 */
interface VillageEditorProps {
	visible: boolean;
	record?: VillageRecord;
	onClose: () => void;
	onSaved: () => void;
}

/** 复用新增与编辑行政村的表单弹窗。 */
const VillageEditor = ({ visible, record, onClose, onSaved }: VillageEditorProps) => {
	// 保存当前行政村名称和启用状态的表单实例。
	const [form] = Form.useForm<VillageForm>();
	// 防止保存期间重复提交或关闭弹窗。
	const [saving, setSaving] = useState(false);
	// 根据待编辑记录同步表单默认值。
	useEffect(() => {
		if (!visible) return;
		form.setFieldsValue({ id: record?.id, name: record?.name || "", status: record?.status === "0" ? "0" : "1" });
	}, [form, record, visible]);

	/** 校验行政村字段并调用本地 mock 或真实接口保存。 */
	const save = async () => {
		const values = await form.validateFields().catch(() => undefined);
		if (!values) return;
		setSaving(true);
		try {
			const payload: VillageForm = { id: record?.id, name: values.name.trim(), status: values.status };
			if (record) await editVillage(payload);
			else await addVillage(payload);
			message.success(record ? "行政村已更新" : "行政村已新增");
			onSaved();
		} catch (error) {
			message.error(error instanceof Error ? error.message : "保存失败，请稍后重试");
		} finally {
			setSaving(false);
		}
	};

	// 渲染行政村名称和状态编辑表单。
	return (
		<Modal
			visible={visible}
			title={record ? "编辑行政村" : "新增行政村"}
			onCancel={saving ? undefined : onClose}
			onOk={save}
			confirmLoading={saving}
			cancelButtonProps={{ disabled: saving }}
			maskClosable={!saving}
			destroyOnClose
		>
			<Form form={form} layout="vertical">
				{/* 行政村基础名称和启停状态 */}
				<Form.Item name="name" label="行政村名称" rules={[{ required: true, whitespace: true, message: "请输入行政村名称" }]}>
					<Input maxLength={50} placeholder="请输入行政村名称" />
				</Form.Item>
				<Form.Item name="status" label="状态" rules={[{ required: true, message: "请选择状态" }]}>
					<Radio.Group>
						<Radio value="1">启用</Radio>
						<Radio value="0">停用</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default VillageEditor;
