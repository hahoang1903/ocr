import React from 'react'
import { Upload, Button, Progress, message } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import axios from 'axios'
import sha1 from 'sha1'

import { convertFirstPageToImage, readFileData } from '../../utils/base64'

const MainContent = ({
	selectValue = '',
	uploadUrl,
	hasSelectEle = false,
	children,
	fileButtonText,
	fileButtonAction,
	mainButtonText,
	responseType
}) => {
	const [state, setState] = React.useState({
		fileList: [],
		progressList: [],
		allowCancel: true
	})

	const { fileList, progressList, allowCancel } = state

	const isCancelledRef = React.useRef(false)
	const currentIntervalRef = React.useRef(null)
	const currentConvertFileRef = React.useRef(0)

	const dummyRequest = async ({ file, onSuccess }) => {
		const newProgressList = [...progressList]
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
		return fileList.length === 0 || fileList.some(isCurrentFileNotReady)
	}

	const isAnyFileConverting = () => {
		return fileList.some(file => file.status === 'converting')
	}

	const getRemoveFunc = i => () => {
		if (isCurrentFileNotReady(fileList[i])) {
			return
		}

		const newFileList = [...fileList]
		const newProgressList = [...progressList]
		newFileList.splice(i, 1)
		newProgressList.splice(i, 1)
		setState({ ...state, fileList: newFileList, progressList: newProgressList })
		currentConvertFileRef.current = 0
	}

	const delaySetState = ({ newState, time }) => {
		setTimeout(() => {
			setState(newState)
		}, time)
	}

	const findUnconvertedOrErrorFile = () => {
		return fileList.findIndex(file => !file.responseData)
	}

	const convert = async () => {
		setState({ ...state, allowCancel: true })
		isCancelledRef.current = false
		const currentFileInd = currentConvertFileRef.current

		const extensionMapper = {
			text: '.txt',
			file: '.docx'
		}

		// file already converted
		if (
			fileList[currentFileInd]?.responseData &&
			fileList[currentFileInd].returnType === extensionMapper[selectValue]
		) {
			const nextFileToConvert = findUnconvertedOrErrorFile()
			if (nextFileToConvert !== -1) {
				currentConvertFileRef.current = nextFileToConvert
				convert()
			}
			return
		}

		// change type of return file then re-convert all files
		if (fileList[currentFileInd].returnType !== extensionMapper[selectValue]) {
			currentConvertFileRef.current = 0
		}

		// set file status to converting
		const newFileList = [...fileList]
		const newProgressList = [...progressList]
		newFileList[currentFileInd].status = 'converting'
		newFileList[currentFileInd].convertError = false
		newFileList[currentFileInd].responseData = null
		newProgressList[currentFileInd] = 0
		setState({ ...state, fileList: newFileList, progressList: newProgressList })

		const sessionId = sha1(new Date().toString() + Math.random(100000))
		const formData = new FormData()
		formData.append('file', newFileList[currentFileInd].originFileObj)
		formData.append('session_id', sessionId)
		formData.append('return_type', selectValue)

		try {
			await axios.post(`http://124.158.1.125:9815/${uploadUrl}`, formData)

			formData.delete('file')
			const returnType = formData.get('return_type')
			formData.delete('return_type')

			currentIntervalRef.current = setInterval(async () => {
				const response = await axios.post('http://124.158.1.125:9815/process_background', formData)

				newProgressList[currentFileInd] = Math.floor(response.data)
				setState({ ...state, progressList: [...newProgressList] })

				if (newProgressList[currentFileInd] === 100) {
					clearInterval(currentIntervalRef.current)

					formData.append('return_type', returnType)
					const res = await axios.post('http://124.158.1.125:9815/process_background', formData, {
						responseType
					})

					if (!isCancelledRef.current) {
						setState({ ...state, allowCancel: false })

						newFileList[currentFileInd] = {
							...newFileList[currentFileInd],
							status: 'done',
							returnType: extensionMapper[returnType],
							responseData: res.data
						}

						delaySetState({ newState: { ...state, fileList: [...newFileList] }, time: 500 })
						// if successfully converted -> convert next file
						if (currentConvertFileRef.current + 1 < fileList.length) {
							currentConvertFileRef.current++
							convert()
						}
					}
				}
			}, 1000)
		} catch (error) {
			newProgressList[currentFileInd] = Math.random() * 81
			newFileList[currentFileInd].convertError = true
			setState({
				...state,
				fileList: [...newFileList],
				progressList: [...newProgressList]
			})

			if (error.response) {
				message.error(error.response.data.message, 5)
			} else {
				message.error('Có lỗi đã xảy ra. Vui lòng thử lại sau', 5)
				console.log(error)
			}

			newFileList[currentFileInd].status = 'done'
			delaySetState({ newState: { ...state, fileList: [...newFileList] }, time: 800 })
		}
	}

	const cancelConvert = () => {
		if (allowCancel) {
			clearInterval(currentIntervalRef.current)
			const newFileList = [...fileList]
			newFileList[currentConvertFileRef.current].status = 'done'
			setState({ ...state, isCancelled: true })
		}
	}

	const getButtonClickHandler = i => () => {
		const file = fileList[i]
		fileButtonAction(file)
	}

	const isCurrentFileConverted = () => {
		return fileList.length > 0 && fileList[currentConvertFileRef.current].responseData ? true : false
	}

	return (
		<div className="main">
			<div className="main-title">
				<span className="main-title main-title--main">CMC OCR - Trích xuất thông tin văn bản hành chính</span>
				<span className="main-title main-title--sub">
					Sản phẩm do Viện nghiên cứu ứng dụng công nghệ CMC CIST nghiên cứu và phát triển
				</span>
			</div>

			<div className="main-drop-zone-wrapper">
				<Upload.Dragger
					name="file"
					accept=".jpg,.jpeg,.png,.pdf"
					className="main-drop-zone"
					onChange={handleChange}
					fileList={fileList}
					customRequest={dummyRequest}
					showUploadList={false}
					maxCount={1}
					style={fileList.length === 0 ? {} : { visibility: 'hidden', pointerEvents: 'none' }}
				>
					<p className="main-drop-zone__hint">Định dạng hỗ trợ gồm JPG, JPEG, PNG, PDF</p>
				</Upload.Dragger>

				<div className="main-file-list">
					{fileList.map((file, i) => (
						<div key={file.uid} className="main-file-list-card">
							{file.status === 'done' || file.status === 'converting' ? (
								<>
									<img src={file.url} alt="pdf file" />
									<div className="main-file-list-card__backdrop" />
									{file.status !== 'converting' && file.responseData ? (
										<Button
											className="main-file-list-card__btn main-file-list-card__btn--download"
											onClick={getButtonClickHandler(i)}
										>
											{fileButtonText}
										</Button>
									) : null}
									<div
										onClick={getRemoveFunc(i)}
										className={`main-file-list-card__btn main-file-list-card__btn--remove${
											isCurrentFileNotReady(file) ? ' main-file-list-card__btn--disabled' : ''
										}`}
									>
										<CloseOutlined />
									</div>
									<span title={file.name} className="main-file-list-card__title">
										{file.name.length > 15 ? `${file.name.substr(0, 6)}...${file.name.slice(-6)}` : file.name}
									</span>
									{file.status === 'converting' ? (
										file.convertError ? (
											<Progress
												className="main-file-list-card__progress"
												percent={progressList[i]}
												size="small"
												status="exception"
											/>
										) : (
											<Progress
												className="main-file-list-card__progress"
												percent={progressList[i]}
												size="small"
											/>
										)
									) : null}
								</>
							) : file.status === 'uploading' ? (
								<Progress percent={progressList[i]} size="small" />
							) : null}
						</div>
					))}
				</div>
			</div>

			{hasSelectEle ? children : null}

			<div className="main-convert">
				{fileList.length > 0 && isAnyFileNotReady() && isAnyFileConverting() ? (
					<Button type="danger" onClick={cancelConvert} disabled={isCurrentFileConverted() || !allowCancel}>
						Hủy
					</Button>
				) : (
					<Button type="primary" onClick={convert} disabled={isAnyFileNotReady()}>
						{mainButtonText}
					</Button>
				)}
			</div>
		</div>
	)
}

export default MainContent
