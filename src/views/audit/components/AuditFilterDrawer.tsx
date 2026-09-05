import { Button, DatePicker, Drawer, Form, Input, InputNumber, Row, Col, Select, Space } from "antd";
import type { Moment } from "moment";
import type { AuditListParams } from "@/api/interface/audit";
import type { VillageRecord } from "@/api/interface/land";
import RegionSelect from "@/views/land/msg/components/RegionSelect";

/** 高级筛选表单中仅供控件使用的字段。 */
interface AuditFilterValues extends AuditListParams {
	position?: string[];
	uploadTime?: [Moment, Moment];
}

/** 高级筛选抽屉属性。 */
interface AuditFilterDrawerProps {
	visible: boolean;
	value: AuditListParams;
	villages: VillageRecord[];
	onClose: () => void;
	onApply: (value: AuditListParams) => void;
}

/** 将业务筛选条件转换为 Ant Design 表单初始值。 */
const createInitialValues = (value: AuditListParams): AuditFilterValues => ({
	...value,
	position: [value.province, value.city, value.district, value.township].filter(Boolean) as string[]
});

/** 审核页身份证、银行卡、人员、区域、面积及时间高级筛选。 */
const AuditFilterDrawer = ({ visible, value, villages, onClose, onApply }: AuditFilterDrawerProps) => {
	// 创建筛选表单实例，支持一键重置。
	const [form] = Form.useForm<AuditFilterValues>();

	/** 提交时把控件临时字段转换为接口字段。 */
	const submit = (values: AuditFilterValues) => {
		const { position, uploadTime, ...rest } = values;
		onApply({
			...rest,
			province: position?.[0],
			city: position?.[1],
			district: position?.[2],
			township: position?.[3],
			beginTime: uploadTime?.[0]?.format("YYYY-MM-DD") || value.beginTime,
			endsTime: uploadTime?.[1]?.format("YYYY-MM-DD") || value.endsTime
		});
	};

	// 渲染高级筛选字段与底部操作按钮。
	return (
		<Drawer
			title="筛选审核地块"
			width={480}
			visible={visible}
			onClose={onClose}
			destroyOnClose
			footer={
				/* 重置、取消和应用筛选操作 */
				<div className="audit-filter-footer">
					<Button onClick={() => form.resetFields()}>重置</Button>
					<Space>
						<Button onClick={onClose}>取消</Button>
						<Button type="primary" onClick={() => form.submit()}>
							确定
						</Button>
					</Space>
				</div>
			}
		>
			{/* 高级筛选表单 */}
			<Form form={form} layout="vertical" initialValues={createInitialValues(value)} onFinish={submit}>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item name="cardid" label="身份证号">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="bankAccount" label="银行卡号">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="relename" label="农户姓名">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="mobile" label="手机号">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="createName" label="上传人">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="areaManager" label="区域经理">
							<Input allowClear placeholder="请输入" />
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="bankMetaStatus" label="校验状态">
							<Select
								allowClear
								placeholder="请选择"
								options={[
									{ value: "1", label: "通过" },
									{ value: "0", label: "未通过" }
								]}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="position" label="地块位置">
							<RegionSelect />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item name="administrativeVillage" label="行政村">
							<Select
								allowClear
								showSearch
								placeholder="请选择"
								options={villages.map(item => ({ value: item.name, label: item.name }))}
							/>
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item label="亩数范围">
							<div className="audit-area-range">
								<Form.Item name="beginActualNum" noStyle>
									<InputNumber min={0} placeholder="最小亩数" style={{ width: "100%" }} />
								</Form.Item>
								<Form.Item name="endActualNum" noStyle>
									<InputNumber min={0} placeholder="最大亩数" style={{ width: "100%" }} />
								</Form.Item>
							</div>
						</Form.Item>
					</Col>
					<Col span={24}>
						<Form.Item name="uploadTime" label="上传时间">
							<DatePicker.RangePicker style={{ width: "100%" }} />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Drawer>
	);
};

export default AuditFilterDrawer;
