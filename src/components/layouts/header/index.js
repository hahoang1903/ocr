import React from 'react'
import { Button, Layout, Drawer, Menu } from 'antd'
import { Link } from 'react-router-dom'
import { MenuOutlined } from '@ant-design/icons'
import logo from './cmc_logo.png'
import fullLogo from './cmc_logo_full.png'

const AppHeader = () => {
	const [visible, setVisible] = React.useState(false)
	const [activeTab, setActiveTab] = React.useState('scan_ocr')

	const handleDrawerClose = () => {
		setVisible(false)
	}

	const openDrawer = () => {
		setVisible(true)
	}

	const handleSelect = ({ key }) => {
		setActiveTab(key)
		setVisible(false)
	}

	const setHomeActive = () => {
		setActiveTab('scan_ocr')
	}

	return (
		<Layout.Header className="header">
			<MenuOutlined className="header-hamburger" onClick={openDrawer} />
			<div className="header-logo">
				<Link to="/" onClick={setHomeActive}>
					<img className="header-logo--short" src={logo} alt="CMC logo" />
					<img className="header-logo--full" src={fullLogo} alt="CMC logo" />
				</Link>
			</div>
			<div className="header-links">
				<Link to="/">
					<Button type="link">Scan OCR</Button>
				</Link>
				<Link to="/extract_info">
					<Button type="link">Trích xuất thông tin</Button>
				</Link>
			</div>
			<Drawer
				title="CMC OCR"
				placement="left"
				closable={true}
				onClose={handleDrawerClose}
				visible={visible}
				width={200}
				bodyStyle={{ padding: 0 }}
			>
				<Menu mode="inline" selectedKeys={[activeTab]} onSelect={handleSelect}>
					<Menu.Item key="scan_ocr" className="header-menu-item">
						<Link to="/">
							<Button className="header-menu-btn" type="link">
								Scan OCR
							</Button>
						</Link>
					</Menu.Item>
					<Menu.Item key="extract_info" className="header-menu-item">
						<Link to="/extract_info">
							<Button className="header-menu-btn" type="link">
								Trích xuất thông tin
							</Button>
						</Link>
					</Menu.Item>
				</Menu>
			</Drawer>
		</Layout.Header>
	)
}

export default AppHeader
