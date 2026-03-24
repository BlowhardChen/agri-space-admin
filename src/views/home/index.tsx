import React from 'react'
import { Card, Row, Col, Statistic, Button } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const Home: React.FC = () => {
  return (
    <div>
      <h1>欢迎来到 Agri Space Admin</h1>
      <Row gutter={16} style={{ margin: '20px 0' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户数量"
              value={1000}
              prefix={<ArrowUpOutlined />}
              suffix="人"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="订单数量"
              value={500}
              prefix={<ArrowUpOutlined />}
              suffix="个"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="销售额"
              value={100000}
              prefix={<ArrowUpOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="利润率"
              value={20}
              prefix={<ArrowDownOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      <Card title="系统信息" style={{ marginTop: 20 }}>
        <p>当前版本: 1.0.0</p>
        <p>最后更新: 2026-03-24</p>
        <p>系统状态: 运行正常</p>
        <Button type="primary" style={{ marginTop: 20 }}>检查更新</Button>
      </Card>
    </div>
  )
}

export default Home
