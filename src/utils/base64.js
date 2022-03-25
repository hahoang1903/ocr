const PDFJS = require('pdfjs-dist/webpack')

const readFileData = file => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = e => {
			resolve(e.target.result)
		}
		reader.onerror = err => {
			reject(err)
		}
		reader.readAsDataURL(file)
	})
}

const convertFirstPageToImage = async data => {
	const pdf = await PDFJS.getDocument(data).promise
	const canvas = document.createElement('canvas')

	const page = await pdf.getPage(1)
	const viewport = page.getViewport({ scale: 1 })
	const context = canvas.getContext('2d')
	canvas.height = viewport.height
	canvas.width = viewport.width
	await page.render({ canvasContext: context, viewport: viewport }).promise
	return canvas.toDataURL()
}

export { convertFirstPageToImage, readFileData }
