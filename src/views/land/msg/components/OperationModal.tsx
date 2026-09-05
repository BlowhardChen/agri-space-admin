import { useState } from "react";
import { Alert, Form, Input, Modal, message } from "antd";
import type { LandRecord } from "@/api/interface/land";
import { editLand, editMergedLand, getLandAddress, mergeLand, transferLand, uploadLandSnapshot } from "@/api/modules/land";
import type { LandMapHandle, MergePreview } from "@/components/LandMap";

/** 待确认的合并、转移或更名业务操作。 */
export interface LandOperation {
	kind: "merge" | "transfer" | "rename";
	records: LandRecord[];
	preview?: MergePreview;
}

/** 操作弹窗只在用户确认后调用写接口。 */
interface OperationModalProps {
	operation: LandOperation;
	map: LandMapHandle | null;
	onClose: () => void;
	onSaved: () => void;
}

/** 合并、转移与更名共用的确认表单。 */
const OperationModal = ({ operation, map, onClose, onSaved }: OperationModalProps) => {
	// 维护输入及请求锁。
	const [form] = Form.useForm<{ name: string; mobile: string }>();
	const [saving, setSaving] = useState(false);
	// 操作涉及的土地实际亩数采用业务面积之和。
	const area = operation.records.reduce((sum, record) => sum + Number(record.actualAcreNum || 0), 0);
	const title = { merge: "合并地块", transfer: "转移地块", rename: "修改地块名称" }[operation.kind];
	/** 等待上传和业务写入都成功后关闭弹窗。 */
	const save = async () => {
		const values = await form.validateFields().catch(() => undefined);
		if (!values) return;
		setSaving(true);
		try {
			if (operation.kind === "transfer") {
				await transferLand({
					mobile: values.mobile.trim(),
					list: operation.records.map(record => ({ landId: record.id, type: record.type || "2" }))
				});
			} else if (operation.kind === "rename") {
				// 合并地块与普通地块使用各自的名称字段和接口。
				const record = operation.records[0];
				await (record.type === "1"
					? editMergedLand({ id: record.id, mergeLandName: values.name.trim() })
					: editLand({ id: record.id, landName: values.name.trim() }));
			} else {
				const preview = operation.preview;
				if (!preview) throw new Error("缺少合并边界");
				// 按源业务契约获取新边界地址并上传地图快照。
				const address = await getLandAddress(preview.coordinates[0][0], preview.coordinates[0][1]);
				const snapshot = await map?.captureSnapshot();
				if (!snapshot) throw new Error("地图截图失败，请切换标准地图后重试");
				const upload = await uploadLandSnapshot(snapshot);
				if (!upload.data?.fileName) throw new Error("地图截图上传失败");
				await mergeLand({
					mergeLandName: values.name.trim(),
					mergeAcreageNum: preview.area,
					...address.addressComponent,
					city: Array.isArray(address.addressComponent.city)
						? address.addressComponent.city.join("")
						: address.addressComponent.city,
					administrativeVillage: operation.records[0].administrativeVillage,
					detailaddress: address.formatted_address,
					url: upload.data.fileName,
					list: preview.coordinates.map(point => ({ lng: point[0], lat: point[1] })),
					landOrList: preview.ids.map(id => ({ landId: id }))
				});
			}
			message.success(title + "成功");
			onSaved();
		} catch (error) {
			message.error(error instanceof Error ? error.message : title + "失败，请重试");
		} finally {
			setSaving(false);
		}
	};
	// 显示合并预览提示、面积及操作对应输入。
	return (
		<Modal
			visible
			title={title}
			onCancel={saving ? undefined : onClose}
			onOk={save}
			confirmLoading={saving}
			cancelButtonProps={{ disabled: saving }}
			maskClosable={!saving}
			width={460}
		>
			<Alert type="info" showIcon message={"共 " + operation.records.length + " 个地块，实际面积 " + area.toFixed(2) + " 亩"} />
			{operation.kind === "merge" && (
				<p className="land-operation-hint">地图虚线为合并后的外围边界，实际亩数按所选地块面积相加。</p>
			)}
			<Form
				form={form}
				layout="vertical"
				initialValues={{ name: operation.kind === "rename" ? operation.records[0].landName : "", mobile: "" }}
				style={{ marginTop: 20 }}
			>
				{operation.kind === "transfer" ? (
					<Form.Item name="mobile" label="所属账号" rules={[{ required: true, whitespace: true, message: "请输入接收账号" }]}>
						<Input placeholder="请输入接收地块的账号" maxLength={50} />
					</Form.Item>
				) : (
					<Form.Item name="name" label="地块名称" rules={[{ required: true, whitespace: true, message: "请输入地块名称" }]}>
						<Input maxLength={100} />
					</Form.Item>
				)}
			</Form>
		</Modal>
	);
};

export default OperationModal;
