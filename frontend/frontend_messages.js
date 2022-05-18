window.$ = require('jquery')

const { ipcRenderer } = require('electron')

initNextPrevButtons = () => {
	$("#next").on("click", () => {
		getNextImage({mode: "increment"})
	})
	$("#prev").on("click", () => {
		getNextImage({mode: "decrement"})
	})
}

setImg = (path) => {
	$("#main-img").attr("src", path)
	// debugger
}

getNextImage = (opts={}) => {
	img_path = ipcRenderer.sendSync("get-next-img", opts)
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
})