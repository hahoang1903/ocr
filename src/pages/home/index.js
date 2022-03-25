import React from 'react'
import { Upload, Button, Progress, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'
import axios from 'axios'
import sha1 from 'sha1'

import { convertFirstPageToImage, readFileData } from '../../utils/base64'
import SiteLayout from '../../components/layouts'

const Home = () => {
	const [state, setState] = React.useState({
		fileList: [],
		progressList: [],
		select: 'text',
		sessionId: sha1(new Date().toString() + Math.random(100000))
	})

	const dummyRequest = async ({ file, onSuccess }) => {
		const newProgressList = [...state.progressList]
		newProgressList.push(25)
		setState({ ...state, progressList: newProgressList })

		file.url = await readFileData(file)

		if (file.type === 'application/pdf') {
			file.url = await convertFirstPageToImage(file.url)
		}

		newProgressList[newProgressList.length - 1] = 100
		setState({ ...state, progressList: [...newProgressList] })

		setTimeout(() => {
			onSuccess('ok')
		}, 500)
	}

	const handleChange = ({ fileList }) => {
		setState({ ...state, fileList })
	}

	const isCurrentFileNotReady = file => {
		return file.status !== 'done'
	}

	const isAnyFileNotReady = () => {
		return state.fileList.length === 0 || state.fileList.some(isCurrentFileNotReady)
	}

	const getRemoveFunc = i => () => {
		if (isCurrentFileNotReady(state.fileList[i])) {
			return
		}

		const newFileList = [...state.fileList]
		newFileList.splice(i, 1)
		const newProgressList = [...state.progressList]
		newProgressList.splice(i, 1)
		setState({ ...state, fileList: newFileList, progressList: newProgressList })
	}

	const handleSelectChange = e => {
		setState({ ...state, select: e.target.value })
	}

	const convert = async () => {
		for (let i = 0; i < state.fileList.length; i++) {
			const newFileList = [...state.fileList]
			const newProgressList = [...state.progressList]
			newFileList[i].status = 'converting'
			newFileList[i].convertError = false
			newProgressList[i] = 0

			setState({ ...state, fileList: newFileList, progressList: newProgressList })

			const formData = new FormData()

			formData.append('file', newFileList[i].originFileObj)
			formData.append('session_id', state.sessionId)
			formData.append('return_type', state.select)

			try {
				await axios.post('http://124.158.1.125:9815/upload_ocr_scan', formData)

				formData.delete('file')
				const returnType = formData.get('return_type')
				formData.delete('return_type')

				const intervalId = setInterval(async () => {
					const response = await axios.post('http://124.158.1.125:9815/process_background', formData)

					newProgressList[i] = Math.floor(response.data)
					setState({ ...state, progressList: [...newProgressList] })

					if (newProgressList[i] === 100) {
						clearInterval(intervalId)

						formData.append('return_type', returnType)
						const res = await axios.post('http://124.158.1.125:9815/process_background', formData, {
							responseType: 'blob'
						})

						const extensionMapper = {
							text: '.txt',
							file: '.docx'
						}

						newFileList[i] = {
							...newFileList[i],
							status: 'done',
							returnType: extensionMapper[returnType],
							downloadBlob: res.data
						}

						setTimeout(() => {
							setState({
								...state,
								fileList: [...newFileList],
								sessionId: sha1(new Date().toString() + Math.random(100000))
							})
						}, 500)
					}
				}, 1000)
			} catch (error) {
				newProgressList[i] = Math.random() * 81
				newFileList[i].convertError = true
				setState({
					...state,
					fileList: [...newFileList],
					progressList: [...newProgressList]
					// sessionId: sha1(new Date().toString() + Math.random(100000))
				})

				if (error.response) {
					message.error(error.response.data.message, 5)
				} else {
					message.error('Có lỗi đã xảy ra. Vui lòng thử lại sau', 5)
					console.log(error)
				}

				setTimeout(() => {
					newFileList[i].status = 'done'
					setState({ ...state, fileList: [...newFileList] })
				}, 800)
			}
		}
	}

	const getDownloadFunc = i => () => {
		const file = state.fileList[i]
		saveAs(file.downloadBlob, `${file.name.slice(0, -4)}${file.returnType}`)
	}

	return (
		<SiteLayout>
			<div className="home-page">
				<div className="home-page-title">
					<span className="home-page-title home-page-title--main">
						CMC OCR - Trích xuất thông tin văn bản hành chính
					</span>
					<span className="home-page-title home-page-title--sub">
						Sản phẩm do Viện nghiên cứu ứng dụng công nghệ CMC CIST nghiên cứu và phát triển
					</span>
				</div>

				<div className="home-page-drop-zone-wrapper">
					<Upload.Dragger
						name="file"
						accept=".jpg,.jpeg,.png,.pdf"
						className="home-page-drop-zone"
						onChange={handleChange}
						fileList={state.fileList}
						customRequest={dummyRequest}
						showUploadList={false}
						maxCount={1}
						style={state.fileList.length === 0 ? {} : { visibility: 'hidden', pointerEvents: 'none' }}
					>
						<p className="home-page-drop-zone__hint">Định dạng hỗ trợ gồm JPG, JPEG, PNG, PDF</p>
					</Upload.Dragger>

					<div className="home-page-file-list">
						{state.fileList.map((file, i) => (
							<div key={file.uid} className="home-page-file-list-card">
								{file.status === 'done' || file.status === 'converting' ? (
									<>
										<img src={file.url} alt="pdf file" />
										<div className="home-page-file-list-card__backdrop" />
										{file.status !== 'converting' && file.downloadBlob ? (
											<Button
												className="home-page-file-list-card__btn home-page-file-list-card__btn--download"
												onClick={getDownloadFunc(i)}
											>
												Tải về
											</Button>
										) : null}
										<div
											onClick={getRemoveFunc(i)}
											className={`home-page-file-list-card__btn home-page-file-list-card__btn--remove${
												isCurrentFileNotReady(file) ? ' home-page-file-list-card__btn--disabled' : ''
											}`}
										>
											<CloseOutlined />
										</div>
										<span title={file.name} className="home-page-file-list-card__title">
											{file.name.length > 15
												? `${file.name.substr(0, 6)}...${file.name.slice(-6)}`
												: file.name}
										</span>
										{file.status === 'converting' ? (
											file.convertError ? (
												<Progress
													className="home-page-file-list-card__progress"
													percent={state.progressList[i]}
													size="small"
													status="exception"
												/>
											) : (
												<Progress
													className="home-page-file-list-card__progress"
													percent={state.progressList[i]}
													size="small"
												/>
											)
										) : null}
									</>
								) : file.status === 'uploading' ? (
									<Progress percent={state.progressList[i]} size="small" />
								) : null}
							</div>
						))}
					</div>
				</div>

				<div className="home-page-select">
					<select onChange={handleSelectChange} value={state.select}>
						<option value="text">Text</option>
						<option value="file">File</option>
					</select>
				</div>

				<div className="home-page-convert">
					<Button type="primary" onClick={convert} disabled={isAnyFileNotReady()}>
						Chuyển đổi
					</Button>
				</div>
			</div>
		</SiteLayout>
	)
}

export default Home
