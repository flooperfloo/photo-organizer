window.$ = require('jquery')

const { ipcRenderer } = require('electron')

filesLeft = 0

initNextPrevButtons = () => {
	$("#next").on("click", () => {
		getNextImage({mode: "increment"})
	})
	$("#prev").on("click", () => {
		getNextImage({mode: "decrement"})
	})
}

addKeypressListeners = () => {
	$("body").on('keyup', function (e) {
		if (e.key == "ArrowRight"){
			getNextImage({mode: 'increment'})
		}
		if (e.key == "ArrowLeft"){
			getNextImage({mode: 'decrement'})
		}

	})

}

setImg = (path) => {
	$("#main-img").attr("src", path)
	// debugger
}

getNextImage = (opts={}) => {
	[numFiles, img_path] = ipcRenderer.sendSync("get-next-img", opts)
	filesLeft = numFiles
	updateFilesLeft(filesLeft)
	setImg(img_path)
}

initSrcFolderSelect = () => {
	$("#src-folder-select").on("click", () => {
		[srcFolder, numFiles] = ipcRenderer.sendSync("src-folder-select")
		if (!srcFolder) { return }
		if (numFiles == 0) {
			alert("no files found")
			return
		}
		localStorage.srcFolder = srcFolder
		getNextImage()
	})
}

updateFilesLeft = (numFiles) => {
	$("#files-left").text(`${numFiles} files left`)
}

initDestFolderSelect = () => {
	$("#dest-folder-select").on("click", () => {
		[destFolder, folders] = ipcRenderer.sendSync("dest-folder-select")
		if (!destFolder) { return }
		localStorage.destFolder = destFolder
		setFolders(folders)
	})
}

setFolders = (folders) => {
	$foldersList = $("#folders-list")
	$foldersList.empty()

	folders.forEach((folder) => {
		addFolderToList($foldersList, folder)
	})
}

addFolderToList = ($foldersList, folder) => {
	$button = $("<button>").addClass("folder-btn")
	$button.text(folder)
	$foldersList.append($button)
}

moveImgToFolder = (folder) =>  {
	newImg = ipcRenderer.sendSync("move-to-folder", folder)
	setImg(newImg)
	updateFilesLeft(filesLeft - 1)
}

initFolderButtons = () => {
	$("#folders-list").on("click", ".folder-btn", (e) => {
		folder = $(e.currentTarget).text()
		moveImgToFolder(folder) 
	})
}

initNewFolderButton = () => {
	$("#add-folder").on("click", (e) => {
		name = $("#new-folder-name").val()
		if (name === "") { return }
		[success, err] = ipcRenderer.sendSync("add-new-folder", name)
		if (success) {
			addFolderToList($("#folders-list"), name)	
		} else {
			alert(err)
		}
		
	})
}

initPhotoClick = () => {
	$("#main-img").on("click", (e) => {
		ipcRenderer.send("open-img", $("#main-img").attr("src"))
	})
}

getCachedFolders = (destFolder) => {
	return ipcRenderer.sendSync("get-cached-folders", destFolder)
}

$(() =>{
	initSrcFolderSelect()
	initDestFolderSelect()
	initNextPrevButtons()
	if (localStorage.srcFolder) {
		getNextImage({cachedSrcFolder: localStorage.srcFolder});
	}
	if (localStorage.destFolder) {
		folders = getCachedFolders(localStorage.destFolder)
		setFolders(folders)
	}
	initFolderButtons()
	initNewFolderButton()
	initPhotoClick()
	addKeypressListeners()
})