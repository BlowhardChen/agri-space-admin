import { Descriptions, Modal, Spin, Tag } from "antd";
import type { ContractRecord } from "@/api/interface/contract";

/** 合同详情弹窗属性。 */
interface ContractDetailProps {
	visible: boolean;
	record?: ContractRecord;
	loading: boolean;
	onClose: () => void;
}

/** 合同状态展示配置。 */
const STATUS_META = {
	"1": { color: "blue", text: "待生效" },
	"2": { color: "green", text: "生效中" },
	"3": { color: "default", text: "已到期" },
	"4": { color: "red", text: "已作废" }
} as const;

/** 展示甲乙双方、土地、合同与作废信息。 */
const ContractDetail = ({ visible, record, loading, onClose }: ContractDetailProps) => {
	// 渲染只读合同详情区块。
	return (
		<Modal title="合同详情" visible={visible} width="70%" footer={null} onCancel={onClose} destroyOnClose>
			<Spin spinning={loading}>
				{record && (
					<div className="contract-detail">
						{/* 合同编号和当前状态 */}
						<div className="contract-detail-title">
							<strong>{record.contractNo}</strong>
							<Tag color={STATUS_META[record.validStatus].color}>{STATUS_META[record.validStatus].text}</Tag>
						</div>
						<Descriptions title="甲方信息" bordered size="small" column={2}>
							<Descriptions.Item label="农户姓名">{record.relename}</Descriptions.Item>
							<Descriptions.Item label="手机号">{record.mobile}</Descriptions.Item>
							<Descriptions.Item label="身份证号">{record.cardid}</Descriptions.Item>
							<Descriptions.Item label="银行卡号">{record.bankAccount || "未知"}</Descriptions.Item>
						</Descriptions>
						<Descriptions title="乙方信息" bordered size="small" column={2}>
							<Descriptions.Item label="承租方">{record.tenantryName}</Descriptions.Item>
							<Descriptions.Item label="联系电话">{record.tenantryMobile}</Descriptions.Item>
							<Descriptions.Item label="联系地址" span={2}>
								{record.tenantryAddress}
							</Descriptions.Item>
						</Descriptions>
						<Descriptions title="土地与合同信息" bordered size="small" column={2}>
							<Descriptions.Item label="实际亩数">{record.actualAcreNum.toFixed(2)} 亩</Descriptions.Item>
							<Descriptions.Item label="地块位置">{record.detailaddress}</Descriptions.Item>
							<Descriptions.Item label="合同类型">{record.contractType === "1" ? "流转" : "托管"}</Descriptions.Item>
							<Descriptions.Item label="合同期限">{record.termOfLease} 年</Descriptions.Item>
							<Descriptions.Item label="合同有效期">
								{record.startTime} 至 {record.endTime}
							</Descriptions.Item>
							<Descriptions.Item label="每亩租金">{record.perAcreAmount.toFixed(2)} 元</Descriptions.Item>
							<Descriptions.Item label="付款金额">{record.paymentAmount.toFixed(2)} 元</Descriptions.Item>
							<Descriptions.Item label="合同总金额">{record.totalAmount.toFixed(2)} 元</Descriptions.Item>
							<Descriptions.Item label="付款方式">
								{record.paymentMethod === "1" ? "年付" : record.paymentMethod === "2" ? "两季付" : "三季付"}
							</Descriptions.Item>
							<Descriptions.Item label="付款时间">{record.times.map(item => item.paymentTime).join("、")}</Descriptions.Item>
							<Descriptions.Item label="备注" span={2}>
								{record.remark || "无"}
							</Descriptions.Item>
						</Descriptions>
						{record.validStatus === "4" && (
							<Descriptions title="作废信息" bordered size="small" column={2}>
								<Descriptions.Item label="作废原因">{record.cancellationRemark}</Descriptions.Item>
								<Descriptions.Item label="操作信息">
									{record.cancellationBy} · {record.cancellationTime}
								</Descriptions.Item>
							</Descriptions>
						)}
					</div>
				)}
			</Spin>
		</Modal>
	);
};

export default ContractDetail;
