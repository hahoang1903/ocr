import React from 'react'
import { Layout } from 'antd'
import logo from './cmc_logo.png'

const AppHeader = () => {
	return (
		<Layout.Header className="header">
			<div className="header-logo">
				<img src={logo} alt="CMC logo" />
			</div>
		</Layout.Header>
	)
}

export default AppHeader
