//Add a listener to the "create new link" button
var linkButton = document.getElementById("newLink");
linkButton.addEventListener("click", onSubmit);

//Sync with persistent storage
const storedPairs = [];

let storedItem = browser.storage.local.get("storage"); //Fetch all names/links stored in memory 
storedItem.then((res) => {
    for (const pair of res.storage) {
        storedPairs.push(pair); //Add stored pairs to local memory
        addRow(pair[0], pair[1], false); //Then re-add them to the table
    }
});

function onSubmit() {
    /**
     * Called when a new row is created via the popup interface, it calls addRow(), then clears the form.
     * @returns {void}
     */

    var name = document.getElementById("name").value;
    var link = document.getElementById("link").value;
    document.getElementById("newLinkForm").reset(); //Clear form then call addRow with arguments
    addRow(name, link, true);
}

function uniqueID() { //This could be improved, but is good enough for a small set of rows
    /**
     * Creates a unique ID using pseudorandom number generation.
     * @returns {string} A random letter, followed by several random numbers.
     */

    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
                    'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    var letter = letters[Math.floor(Math.random()*26)]
    return letter + Math.floor(Math.random() * Date.now()).toString();
}

function addRow(name, link, newEntry) {
    /**
     * Creates a new row in the popup table, and optionally adds this new row to extension storage.
     * @param {[string]} name The name for the new link.
     * @param {string} link The Zoom link that will be linked to.
     * @returns {void}
     */

    //First, create a new row in the table
    var table = document.getElementById("linkTable");
    var row = table.insertRow(-1);
    var rowID = uniqueID();
    console.log(rowID);
    row.id = rowID;
    var nameCell = row.insertCell(-1);
    var linkCell = row.insertCell(-1);
    var removeCell = row.insertCell(-1);

    //Then, update each cell's value
    nameCell.innerHTML = name;
    var joinLink = document.createElement("a");
    var joinText = document.createTextNode("Join");
    joinLink.appendChild(joinText);
    joinLink.title = "Join"
    joinLink.href = link;
    joinLink.target = "_blank"
    linkCell.appendChild(joinLink);
    removeCell.innerHTML = "X"; //Create a button that will remove the row if clicked on
    removeCell.addEventListener("click", () => {removeRow(name, rowID)});

    //Add the new link to memory only if it is a new entry
    if (newEntry) {
        const newPair = [name, link];
        storedPairs.push(newPair);
        browser.storage.local.set({
            storage: storedPairs
        });
    }
}

function removeRow(name, id) {
    /**
     * @param {string} name The name of the row that will be removed.
     * @param {string} id The ID of the row that will be removed.
     * @returns {void}
     */

    console.log("what the shit");
    var row = document.getElementById(id); //Remove from table first
    row.parentNode.removeChild(row);

    for (var i = 0; i < storedPairs.length; i++) { //Then find the corresponding pair in memory and delete it
        if (storedPairs[i][0] == name) {
            storedPairs.splice(i, 1);
        }
    }
    browser.storage.local.set({ //Finally, update memory with the new list of pairs
        storage: storedPairs
    });
}