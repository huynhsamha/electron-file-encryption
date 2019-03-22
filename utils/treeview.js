const fs = require('fs');
const path = require('path');
const uid = require('uuid/v1')
const async = require('async');
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
        this.files = []; // list of Files
    }

    renderItem(item) {
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

    updateSizeOnView($item, newItem) {
        $($item).find('> .content > .description').text(humanFileSize(newItem.size));
    }

    addFile(file) {
        const item = new File(file);
        this.files.push(item)
        $(this.id).append(this.renderItem(item))
    }

    createFolder(folder, cb) {
        const $folder = $(this.renderItem(folder))
        const $this = this;
        console.log('Folder');
        console.log(folder);
        fs.readdir(folder.path, (err, files) => {
            if (err) return cb(err);
            async.eachSeries(files, (filename, cb1) => {
                const filepath = path.join(folder.path, filename)
                const file = {
                    name: filename,
                    path: filepath,
                    size: null
                }
                console.log(filepath);
                fs.lstat(filepath, (err, stat) => {
                    if (err) return cb1(err);
                    file.size = stat.size;
                    if (stat.isFile()) {
                        folder.size += file.size; // update size of folder
                        const newItem = new File(file);
                        $this.files.push(newItem)
                        $folder.find('> .content > .list').append($this.renderItem(newItem))
                        cb1();

                    } else if (stat.isDirectory()) {
                        const subFolder = new Folder(file)
                        $this.createFolder(subFolder, (err, $subFolder, subFolder) => {
                            if (err) return cb1(err);
                            folder.size += subFolder.size; 
                            // update size of master folder with size of sub-folder
                            $folder.find('> .content > .list').append($subFolder)
                            cb1();
                        })

                    } else {
                        cb1(new Error('Something is wrong'));
                    }
                })
            }, (err) => {
                if (err) return cb(err);
                $this.updateSizeOnView($folder, folder);
                return cb(null, $folder, folder);
            })
        })
    }

    addFolder(file) {
        const folder = new Folder(file);
        this.createFolder(folder, (err, $folder, folder) => {
            if (err) {
                console.log(err);
            } else {
                $(this.id).append($folder)
            }
        })
    }
}


module.exports = {
    Folder,
    File,
    ItemTreeView,
    TreeView
}