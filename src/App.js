import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SiteLayout from './components/layouts'
import ErrorPage from './pages/404'
import ExtractInfo from './pages/extract-info'
import Home from './pages/home'

function App() {
	return (
		<div className="app">
			<Router>
				<SiteLayout>
					<Routes>
						<Route path="*" element={<ErrorPage />} />

						<Route path="/" element={<Home />} />
						<Route path="/extract_info" element={<ExtractInfo />} />
					</Routes>
				</SiteLayout>
			</Router>
		</div>
	)
}

export default App
