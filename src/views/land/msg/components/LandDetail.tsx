import { useEffect, useState } from "react";
import { Alert, Button, Descriptions, Divider, Drawer, Empty, Spin } from "antd";
import type { LandRecord } from "@/api/interface/land";
import { getLandDetail } from "@/api/modules/land";

/** 详情抽屉属性。 */
interface LandDetailProps {
	id: string;
	readOnly?: boolean;
	onClose: () => void;
	onEdit: (record: LandRecord, mode: "base" | "contract") => void;
}

/** 加载单块完整资料，展示土地基础与关联合同。 */
const LandDetail = ({ id, readOnly, onClose, onEdit }: LandDetailProps) => {
	// 独立加载状态避免显示上一条地块资料。
	const [record, setRecord] = useState<LandRecord>();
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [revision, setRevision] = useState(0);
	useEffect(() => {
		// 请求完成时确认抽屉仍然对应当前地块。
		let active = true;
		setLoading(true);
		setRecord(undefined);
		setFailed(false);
		getLandDetail(id)
			.then(response => {
				if (active) {
					setRecord(response.data);
					setFailed(!response.data);
				}
			})
			.catch(() => {
				if (active) setFailed(true);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [id, revision]);
	// 提取可选合同供描述区域读取。
	const contract = record?.landContract;
	// 展示加载、重试和基础/合同详情。
	return (
		<Drawer visible title="地块详情" width={500} onClose={onClose}>
			<Spin spinning={loading}>
				{failed && (
					<Alert
						type="error"
						showIcon
						message="地块详情加载失败"
						action={<Button onClick={() => setRevision(value => value + 1)}>重试</Button>}
					/>
				)}
				{record && (
					<>
						{/* 农户、土地和上传信息 */}
						<div className="land-section-title">
							<h3>基础信息</h3>
							{!readOnly && <Button onClick={() => onEdit(record, "base")}>修改</Button>}
						</div>
						<Descriptions bordered size="small" column={1}>
							{(
								[
									{ label: "农户姓名 / 地块名称", key: "landName" },
									{ label: "手机号码", key: "mobile" },
									{ label: "身份证号", key: "cardid" },
									{ label: "银行卡号", key: "bankAccount" }
								] as const
							).map(field => (
								<Descriptions.Item key={field.key} label={field.label}>
									{record[field.key] || "未知"}
								</Descriptions.Item>
							))}
							<Descriptions.Item label="土地类型">
								{record.landType === "1" ? "流转" : record.landType === "2" ? "托管" : "未知"}
							</Descriptions.Item>
							<Descriptions.Item label="测量面积">{record.acreageNum ?? "未知"} 亩</Descriptions.Item>
							<Descriptions.Item label="实际面积">{record.actualAcreNum ?? "未知"} 亩</Descriptions.Item>
							<Descriptions.Item label="地块位置">
								{[record.province, record.city, record.district, record.township, record.administrativeVillage]
									.filter(Boolean)
									.join(" ") || "未知"}
							</Descriptions.Item>
							{(
								[
									{ label: "详细地址", key: "detailaddress" },
									{ label: "上传人", key: "createName" },
									{ label: "上传时间", key: "createTime" },
									{ label: "区域经理", key: "memberName" },
									{ label: "经理电话", key: "memberMobile" }
								] as const
							).map(field => (
								<Descriptions.Item key={field.key} label={field.label}>
									{record[field.key] || "未知"}
								</Descriptions.Item>
							))}
						</Descriptions>
						<Divider />
						{/* 土地关联的合同及付款信息 */}
						<div className="land-section-title">
							<h3>合同信息</h3>
							{!readOnly && <Button onClick={() => onEdit(record, "contract")}>{contract ? "修改" : "新增"}</Button>}
						</div>
						{contract ? (
							<Descriptions bordered size="small" column={1}>
								<Descriptions.Item label="合同编号">{contract.contractNo || "未知"}</Descriptions.Item>
								<Descriptions.Item label="租赁期限">{contract.termOfLease ?? "未知"} 年</Descriptions.Item>
								<Descriptions.Item label="起止时间">
									{contract.startTime} ～ {contract.endTime}
								</Descriptions.Item>
								<Descriptions.Item label="每亩租金">{contract.perAcreAmount ?? "未知"} 元</Descriptions.Item>
								<Descriptions.Item label="合同总金额">{contract.totalAmount ?? "未知"} 元</Descriptions.Item>
								<Descriptions.Item label="付款方式">
									{{ "1": "年付", "2": "两季付", "3": "三季付" }[contract.paymentMethod ?? "1"]}
								</Descriptions.Item>
								<Descriptions.Item label="每期付款金额">{contract.paymentAmount ?? "未知"} 元</Descriptions.Item>
								<Descriptions.Item label="付款日期">
									{contract.times?.map(time => time.paymentTime).join("、") || "未知"}
								</Descriptions.Item>
								<Descriptions.Item label="实际面积">{contract.actualAcreNum ?? "未知"} 亩</Descriptions.Item>
								<Descriptions.Item label="地块位置">{contract.detailaddress || "未知"}</Descriptions.Item>
								<Descriptions.Item label="创建人">{contract.createName || "未知"}</Descriptions.Item>
							</Descriptions>
						) : (
							<Empty description="暂无合同信息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
						)}
					</>
				)}
			</Spin>
		</Drawer>
	);
};

export default LandDetail;
