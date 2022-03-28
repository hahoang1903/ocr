import React from 'react'
import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

const ErrorPage = () => {
	return (
		<Result
			status="404"
			title="404"
			subTitle="Trang bạn tìm kiếm không tồn tại."
			extra={
				<Button type="primary">
					<Link to="/">Quay lại</Link>
				</Button>
			}
		/>
	)
}

export default ErrorPage
