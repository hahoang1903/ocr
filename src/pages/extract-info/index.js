import { Modal } from 'antd'
import React from 'react'
import MainContent from '../../components/main-content'

const ExtractInfo = () => {
	const generatePreviewImage = imageData => {
		return `data:image/png;base64,${imageData}`
	}

	const viewFile = file => {
		Modal.info({
			title: file.name,
			content: (
				<img
					className="extract-info-img"
					src={generatePreviewImage(file.responseData.ImageData)}
					alt="extracted info"
				/>
			),
			okText: 'Đóng',
			icon: null,
			centered: true,
			maskClosable: true
		})
	}

	return (
		<MainContent
			selectValue="admin"
			uploadUrl="document_ie"
			responseType="json"
			fileButtonText="Xem ảnh trích xuất"
			mainButtonText="Trích xuất"
			fileButtonAction={viewFile}
		/>
	)
}

export default ExtractInfo
