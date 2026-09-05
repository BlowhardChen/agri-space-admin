import { Button, Descriptions, Drawer, Space, Spin, Tag } from "antd";
import type { AuditRecord } from "@/api/interface/audit";

/** 审核地块详情抽屉属性。 */
interface AuditDetailDrawerProps {
	visible: boolean;
	record?: AuditRecord;
	loading: boolean;
	onClose: () => void;
	onEdit: (record: AuditRecord) => void;
	onAction: (action: "quit" | "recover" | "delete", record: AuditRecord) => void;
}

/** 审核状态展示配置。 */
const STATUS_META = {
	"0": { color: "orange", text: "待审核" },
	"1": { color: "green", text: "已审核" },
	"2": { color: "default", text: "已退地" }
} as const;

/** 展示地块基础、合同及操作信息的详情抽屉。 */
const AuditDetailDrawer = ({ visible, record, loading, onClose, onEdit, onAction }: AuditDetailDrawerProps) => {
	// 渲染详情分组及与当前状态匹配的操作按钮。
	return (
		<Drawer title="地块详情" width={480} visible={visible} onClose={onClose} destroyOnClose>
			{/* 异步详情加载状态 */}
			<Spin spinning={loading}>
				{record && (
					<div className="audit-detail">
						{/* 审核状态与基础资料 */}
						<div className="audit-detail-heading">
							<h3>{record.landName}</h3>
							<Tag color={STATUS_META[record.status].color}>{STATUS_META[record.status].text}</Tag>
						</div>
						<Descriptions title="基础信息" column={1} size="small" bordered>
							<Descriptions.Item label="农户姓名">{record.relename || record.landName}</Descriptions.Item>
							<Descriptions.Item label="手机号码">{record.mobile || "未知"}</Descriptions.Item>
							<Descriptions.Item label="身份证号">{record.cardid || "未知"}</Descriptions.Item>
							<Descriptions.Item label="银行卡号">{record.bankAccount || "未知"}</Descriptions.Item>
						</Descriptions>
						{/* 地块测量与上传资料 */}
						<Descriptions title="土地信息" column={1} size="small" bordered>
							<Descriptions.Item label="土地类型">{record.landType === "1" ? "流转" : "托管"}</Descriptions.Item>
							<Descriptions.Item label="测量面积">
								测量 {record.acreageNum} 亩，实际 {record.actualAcreNum} 亩
							</Descriptions.Item>
							<Descriptions.Item label="地块位置">{record.detailaddress || "未知"}</Descriptions.Item>
							<Descriptions.Item label="上传人">
								{record.createName || "未知"} · {record.createMobile || "未知"}
							</Descriptions.Item>
							<Descriptions.Item label="上传时间">{record.createTime || "未知"}</Descriptions.Item>
							<Descriptions.Item label="区域经理">
								{record.memberName || "未知"} · {record.memberMobile || "未知"}
							</Descriptions.Item>
						</Descriptions>
						{/* 已审核合同资料 */}
						{record.status === "1" && (
							<Descriptions title="合同信息" column={1} size="small" bordered>
								<Descriptions.Item label="合同编号">{record.contractNo || "未知"}</Descriptions.Item>
								<Descriptions.Item label="租赁期限">{record.termOfLease || 0} 年</Descriptions.Item>
								<Descriptions.Item label="有效期">
									{record.startTime} 至 {record.endTime}
								</Descriptions.Item>
								<Descriptions.Item label="每亩租金">{record.perAcreAmount || 0} 元</Descriptions.Item>
								<Descriptions.Item label="付款方式">
									{record.paymentMethod === "1" ? "年付" : record.paymentMethod === "2" ? "两季付" : "三季付"}
								</Descriptions.Item>
								<Descriptions.Item label="单次付款">{record.paymentAmount || 0} 元</Descriptions.Item>
							</Descriptions>
						)}
						{/* 地块状态操作 */}
						<Space className="audit-detail-actions">
							<Button danger onClick={() => onAction("delete", record)}>
								删除
							</Button>
							{record.status === "2" ? (
								<Button type="primary" onClick={() => onAction("recover", record)}>
									恢复
								</Button>
							) : (
								<Button onClick={() => onAction("quit", record)}>退地</Button>
							)}
							{record.status !== "2" && (
								<Button type="primary" onClick={() => onEdit(record)}>
									{record.status === "0" ? "审核信息" : "修改"}
								</Button>
							)}
						</Space>
					</div>
				)}
			</Spin>
		</Drawer>
	);
};

export default AuditDetailDrawer;
