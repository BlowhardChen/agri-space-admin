import React from 'react'
import { Outlet } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ height: 32, margin: 16, background: '#fff', borderRadius: 8 }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              label: '首页'
            },
            {
              key: '2',
              label: '用户管理'
            },
            {
              key: '3',
              label: '系统设置'
            }
          ]}
        />
      </Sider>
      <AntLayout>
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{ marginRight: 16 }}
          />
          <div style={{ flex: 1 }}>Agri Space Admin</div>
          <div>欢迎，管理员</div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
