let fileConfig;

function loadFile(f) {
    fileConfig = f.files[0];
    let fileReader = new FileReader();

    console.log(fileConfig)

    fileReader.onload = function(ev) {
        let buffer = new Uint8Array(ev.target.result);
        
        document.querySelector("#uploader").style.display = "none";
        document.querySelector("#image-data").style.display = "grid";
        document.querySelector("#data-hex").textContent = Array.from(buffer)
            .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
            .join(" ");
            
        const decoder = new TextDecoder("utf-8")
        document.querySelector("#data-string").textContent = decoder.decode(buffer);

        if (fileConfig.type.startsWith("image")) {
            document.querySelector("#media").innerHTML = `<img src='${getDataUrl(buffer, fileConfig.type)}' alt='' width='400'/>`;
        } else if (fileConfig.type.startsWith("audio")) {
            document.querySelector("#media").innerHTML = `<audio src='${getDataUrl(buffer, fileConfig.type)}' width='400' controls></audio>`;
        } else if (fileConfig.type.startsWith("video")) {
            document.querySelector("#media").innerHTML = `<video src='${getDataUrl(buffer, fileConfig.type)}' width='400' controls></video>`;
        } else {
            document.querySelector("#media").innerHTML = `<iframe src='${getDataUrl(buffer, fileConfig.type)}' width='400' height='250'></iframe>`;
        }
    }

    fileReader.readAsArrayBuffer(fileConfig);
}

function getDataUrl(buffer, mimeType = 'application/octet-stream') {
    // console.log(buffer);
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    if (document.querySelector("#media").firstChild) {
        document.querySelector("#media").firstChild.onload = function() {
            URL.revokeObjectURL(url);
        }
    }
    return url;
}

document.querySelector("#data-hex").oninput = function(ev) {
    let buffer = new Uint8Array(ev.target.value.split(/\s+/).map(hex => parseInt(hex, 16)));
    URL.revokeObjectURL(document.querySelector("#media").firstChild.src);
    document.querySelector("#media").firstChild.src = "";
    document.querySelector("#media").firstChild.src = getDataUrl(buffer, fileConfig.type);
    // console.log(getDataUrl(buffer, fileConfig.type));
    const decoder = new TextDecoder("utf-8")
    document.querySelector("#data-string").textContent = decoder.decode(buffer);

}

document.querySelector("#dl-btn").onclick = async function() {
    const buffer = new Uint8Array(document.querySelector("#data-hex").value.split(/\s+/).map(hex => parseInt(hex, 16)));
    console.log(buffer)
    // const blob = new Blob([buffer], { type: fileConfig.type} );

    var fileHandle = await window.showSaveFilePicker({
        types: [
            {
                description: 'Files',
                accept: {
                    [fileConfig.type]: [ `.${fileConfig.name.split('.').pop()}` ]
                }
            }
        ]
    })
    
    console.log(await fileHandle)
    var writable = await fileHandle.createWritable();
    await writable.write(buffer);
    await writable.close();
    // window.filesystem
}