import { useEffect, useState } from "react";
import { Checkbox, Drawer, Empty, Input, Radio, Spin, Tabs, Tag } from "antd";
import type { FarmLandType, FarmMapLand } from "@/api/interface/farmMap";

/** 地图选地面板使用场景。 */
export type FarmLandSelectorMode = "editor" | "assign";

/** 农事地块选择面板属性。 */
interface FarmLandSelectorProps {
	visible: boolean;
	mode: FarmLandSelectorMode;
	lands: FarmMapLand[];
	selectedIds: string[];
	assignMobile: string;
	loading: boolean;
	confirming: boolean;
	onToggle: (landId: string) => void;
	onAssignMobileChange: (value: string) => void;
	onClose: () => void;
	onConfirm: () => void;
}

/** 在地图旁展示可选地块、选择统计和分配账号。 */
const FarmLandSelector = ({
	visible,
	mode,
	lands,
	selectedIds,
	assignMobile,
	loading,
	confirming,
	onToggle,
	onAssignMobileChange,
	onClose,
	onConfirm
}: FarmLandSelectorProps) => {
	// 控制查看已选中或未选中地块。
	const [selectionTab, setSelectionTab] = useState<"selected" | "unselected">("selected");
	// 控制地块经营类型筛选。
	const [landType, setLandType] = useState<"" | FarmLandType>("");
	// 创建选中 ID 集合以提高列表判断效率。
	const selectedSet = new Set(selectedIds);
	// 根据选择状态和经营类型得到当前面板列表。
	const visibleLands = lands.filter(land => {
		const selectionMatches = selectionTab === "selected" ? selectedSet.has(land.id) : !selectedSet.has(land.id);
		return selectionMatches && (!landType || land.landType === landType);
	});
	// 汇总选中地块总面积。
	const totalArea = Number(
		lands
			.filter(land => selectedSet.has(land.id))
			.reduce((sum, land) => sum + land.actualAcreNum, 0)
			.toFixed(2)
	);
	// 汇总流转地块面积。
	const transferArea = Number(
		lands
			.filter(land => selectedSet.has(land.id) && land.landType === "1")
			.reduce((sum, land) => sum + land.actualAcreNum, 0)
			.toFixed(2)
	);
	// 汇总托管地块面积。
	const managedArea = Number(
		lands
			.filter(land => selectedSet.has(land.id) && land.landType === "2")
			.reduce((sum, land) => sum + land.actualAcreNum, 0)
			.toFixed(2)
	);
	// 分配场景必须同时提供账号和地块。
	const confirmDisabled = !selectedIds.length || (mode === "assign" && !assignMobile.trim());

	useEffect(() => {
		// 每次打开选地面板时从已选列表和全部类型开始查看。
		if (!visible) return;
		setSelectionTab("selected");
		setLandType("");
	}, [visible]);

	// 渲染地图旁的地块选择抽屉。
	return (
		<Drawer
			title="选择农事地块"
			visible={visible}
			width={410}
			placement="right"
			mask={false}
			getContainer={false}
			style={{ position: "absolute" }}
			className="farm-land-selector"
			onClose={onClose}
			footer={
				<div className="farm-land-selector-footer">
					<div>
						共计 <strong>{totalArea}</strong> 亩<br />
						<span>
							流转 {transferArea} 亩，托管 {managedArea} 亩
						</span>
					</div>
					<div>
						<button onClick={onClose}>取消</button>
						<button className="is-primary" disabled={confirmDisabled || confirming} onClick={onConfirm}>
							{confirming ? "处理中…" : "确定"}
						</button>
					</div>
				</div>
			}
			destroyOnClose
		>
			{/* 已选和未选状态标签 */}
			<Tabs activeKey={selectionTab} onChange={value => setSelectionTab(value as "selected" | "unselected")} centered>
				<Tabs.TabPane tab={`已选中(${selectedIds.length})`} key="selected" />
				<Tabs.TabPane tab={`未选中(${Math.max(0, lands.length - selectedIds.length)})`} key="unselected" />
			</Tabs>
			{/* 地块经营类型筛选 */}
			<Radio.Group
				value={landType}
				buttonStyle="solid"
				className="farm-land-type-tabs"
				onChange={event => setLandType(event.target.value)}
			>
				<Radio.Button value="">全部</Radio.Button>
				<Radio.Button value="1">流转</Radio.Button>
				<Radio.Button value="2">托管</Radio.Button>
			</Radio.Group>
			{/* 分配场景所属账号 */}
			{mode === "assign" && (
				<div className="farm-assign-account">
					<label>所属账号</label>
					<Input
						value={assignMobile}
						onChange={event => onAssignMobileChange(event.target.value)}
						placeholder="请输入机耕队长账号"
					/>
				</div>
			)}
			{/* 当前状态下的地块列表 */}
			<Spin spinning={loading}>
				<div className="farm-selector-land-list">
					{visibleLands.length ? (
						visibleLands.map(land => (
							<button
								key={land.id}
								className={`farm-selector-land${selectedSet.has(land.id) ? " is-selected" : ""}`}
								onClick={() => onToggle(land.id)}
							>
								<Checkbox
									checked={selectedSet.has(land.id)}
									onClick={event => event.stopPropagation()}
									onChange={() => onToggle(land.id)}
								/>
								<div className={`farm-land-thumbnail is-type-${land.landType}`}>
									<span>{land.landType === "1" ? "流转" : "托管"}</span>
								</div>
								<div className="farm-selector-land-info">
									<strong>{land.landName}</strong>
									<span>
										实际面积：<em>{land.actualAcreNum.toFixed(2)}</em> 亩
									</span>
									<span>
										区域经理：{land.createName}-{land.createMobile}
									</span>
									<span>创建时间：{land.createTime}</span>
								</div>
								<Tag color={land.landType === "1" ? "green" : "cyan"}>{land.landType === "1" ? "流转" : "托管"}</Tag>
							</button>
						))
					) : (
						<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无地块" />
					)}
				</div>
			</Spin>
		</Drawer>
	);
};

export default FarmLandSelector;
