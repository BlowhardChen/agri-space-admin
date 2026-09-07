import { Button, Descriptions, Drawer, Progress, Spin, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import type { FarmTaskRecord } from "@/api/interface/farmMap";

/** 农事详情抽屉属性。 */
interface FarmDetailDrawerProps {
	visible: boolean;
	record?: FarmTaskRecord;
	loading: boolean;
	onClose: () => void;
	onEdit: (record: FarmTaskRecord) => void;
}

/** 展示农事基础信息、任务数据、作业标准和分配信息。 */
const FarmDetailDrawer = ({ visible, record, loading, onClose, onEdit }: FarmDetailDrawerProps) => {
	// 渲染右侧农事详情抽屉。
	return (
		<Drawer title="农事详情" visible={visible} width={460} onClose={onClose} destroyOnClose>
			<Spin spinning={loading}>
				{record && (
					<div className="farm-detail">
						{/* 农事标题和编辑入口 */}
						<div className="farm-detail-heading">
							<div>
								<strong>{record.farmingName}</strong>
								<Tag color={record.workStatus === "1" ? "orange" : "blue"}>{record.workStatus === "1" ? "作业中" : "已完成"}</Tag>
							</div>
							<Button icon={<EditOutlined />} onClick={() => onEdit(record)}>
								编辑
							</Button>
						</div>
						{/* 农事基础信息 */}
						<Descriptions title="基础信息" bordered size="small" column={1}>
							<Descriptions.Item label="作物类型">{record.dictLabel}</Descriptions.Item>
							<Descriptions.Item label="农事类型">{record.farmingTypeName}</Descriptions.Item>
							<Descriptions.Item label="技术标准">{record.farmingScienceName}</Descriptions.Item>
							<Descriptions.Item label="作业周期">
								{record.workBeginTime} ～ {record.workEndTime}
							</Descriptions.Item>
							<Descriptions.Item label="区域经理">
								{record.nickName} - {record.mobile}
							</Descriptions.Item>
							<Descriptions.Item label="机耕队长">
								{record.teamName} - {record.teamMobile}
							</Descriptions.Item>
							<Descriptions.Item label="机耕队员">
								{record.teamMemberVoList.map(member => `${member.teamMemberName}-${member.teamMemberMobile}`).join("、")}
							</Descriptions.Item>
						</Descriptions>
						{/* 农事面积和完成度 */}
						<Descriptions title="农事数据" bordered size="small" column={1}>
							<Descriptions.Item label="农事地块">{record.landNum} 块</Descriptions.Item>
							<Descriptions.Item label="总面积">{record.totalArea.toFixed(2)} 亩</Descriptions.Item>
							<Descriptions.Item label="作业面积">{record.workArea.toFixed(2)} 亩</Descriptions.Item>
							<Descriptions.Item label="完成进度">
								<Progress percent={record.finishNum} size="small" />
							</Descriptions.Item>
						</Descriptions>
						{/* 农事作业标准 */}
						<Descriptions title="作业标准" bordered size="small" column={1}>
							{record.typeFieldOptionRequestList.map(field => (
								<Descriptions.Item key={field.id} label={field.farmingFieldName}>
									{field.farmingFieldOptionContent}
								</Descriptions.Item>
							))}
						</Descriptions>
						{/* 创建和分配记录 */}
						<Descriptions title="其他信息" bordered size="small" column={1}>
							<Descriptions.Item label="创建人">
								{record.createBy} - {record.createMobile}
							</Descriptions.Item>
							<Descriptions.Item label="创建时间">{record.createTime}</Descriptions.Item>
							<Descriptions.Item label="创建来源">{record.createSource === "1" ? "APP" : "管理端"}</Descriptions.Item>
							<Descriptions.Item label="分配人">
								{record.assignBy} - {record.assignMobile}
							</Descriptions.Item>
							<Descriptions.Item label="分配时间">{record.assignTime}</Descriptions.Item>
							<Descriptions.Item label="分配来源">{record.assignSource === "1" ? "APP" : "管理端"}</Descriptions.Item>
						</Descriptions>
					</div>
				)}
			</Spin>
		</Drawer>
	);
};

export default FarmDetailDrawer;
