import React from 'react'
import AppHeader from './header'
import { Layout } from 'antd'

const SiteLayout = ({ children }) => {
	return (
		<Layout className="layout">
			<AppHeader />
			<Layout.Content>{children}</Layout.Content>
		</Layout>
	)
}

export default SiteLayout
