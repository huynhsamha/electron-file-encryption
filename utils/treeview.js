const fs = require('fs');
const path = require('path');
const uid = require('uuid/v1')
const { humanFileSize } = require('./fmt');

class ItemTreeView {
    constructor(file) {
        this.id = uid();
        this.name = file.name;
        this.size = file.size;
        this.path = file.path;
    }
}

class File extends ItemTreeView {
}

class Folder extends ItemTreeView {
    constructor(file) {
        super(file);
        this.files = [];
    }
}

class TreeView {

    constructor(id) {
        this.id = id || uid();
        this.files = [];
    }

    makeItem(item) {
        const isFolder = item instanceof Folder
        const itemType = isFolder ? 'folder' : 'file alternate'
        const color = isFolder ? 'blue' : 'black'
        return `
            <div class="item" id="${item.id}">
                <i class="${itemType} ${color} icon"></i>
                <div class="content">
                    <div class="header">${item.name}</div>
                    <div class="description">${humanFileSize(item.size)}</div>
                    ${isFolder ? '<div class="list"></div>' : ''}
                </div>
            </div>`
    }

    addFile(file) {
        const item = new File(file);
        $(this.id).append(this.makeItem(item))
    }

    createFolder(item) {
        const $folder = $(this.makeItem(item))
        const $this = this;
        fs.readdir(item.path, (err, files) => {
            if (err) {
                console.log(err);
            } else {
                files.forEach(filename => {
                    const filepath = path.join(item.path, filename)
                    const ritem = {
                        name: filename,
                        path: filepath,
                        size: null
                    }
                    fs.lstat(filepath, (err, stat) => {
                        if (err) {
                            console.log(err);
                        } else {
                            ritem.size = stat.size;
                            if (stat.isFile()) {
                                $folder.find('.list').append($this.makeItem(new File(ritem)))
                            } else if (stat.isDirectory()) {
                                $folder.find('.list').append($this.createFolder(new Folder(ritem)))
                            }
                        }
                    })
                })
            }
        })
        return $folder;
    }

    addFolder(file) {
        const item = new Folder(file);
        const $folder = this.createFolder(item);
        $(this.id).append($folder)
    }
}


module.exports = {
    Folder,
    File,
    ItemTreeView,
    TreeView
}