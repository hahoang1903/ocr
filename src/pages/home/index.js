import React from 'react'
import { saveAs } from 'file-saver'

import MainContent from '../../components/main-content'

const Home = () => {
	const [select, setSelect] = React.useState('text')

	const handleSelectChange = e => {
		setSelect(e.target.value)
	}

	const saveFile = file => {
		saveAs(file.responseData, `${file.name.slice(0, -4)}${file.returnType}`)
	}

	return (
		<MainContent
			selectValue={select}
			hasSelectEle={true}
			uploadUrl="upload_ocr_scan"
			responseType="blob"
			fileButtonText="Tải về"
			fileButtonAction={saveFile}
			mainButtonText="Chuyển đổi"
		>
			<div className="home-page-select">
				<select onChange={handleSelectChange} value={select}>
					<option value="text">Text</option>
					<option value="file">File</option>
				</select>
			</div>
		</MainContent>
	)
}

export default Home
