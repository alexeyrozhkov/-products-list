const form = document.querySelector('.createListForm');

const products = [];
const url = 'http://localhost:3030/products';

/**
 * @param {method:string; body?:Object; path?:string;}
 */

function sendRequest({method, body, path}) {
    const requestUrl = path || path === 0 ? `${url}/${path}` : url;
    const headers =  {
        'Content-Type': 'application/json'
    };
    const options = {
        method: method,
        body: JSON.stringify(body)
    }
    if(method === 'POST' || method === 'PUT') {
        options.headers = headers;
    }
    return fetch(requestUrl,options)
    .then(data => {
        if(data.status === 200) {
            return data;
        }
        throw new Error(data.status);
    })
}


/**
 * @param {{id:number; text:string; count:number;}} list
 */

function getItemTemplate(list) {
    return `<div class="content">
                <input type="text" disabled value="${list.text}" class="ListInput"/>
            </div>
            <div class="actions">
                <div class="controls">
                    <button type="button" class="button-control minus">-</button>
                    <input type="text" disabled value="${list.count}" class="control-value">
                    <button type="button" class="button-control plus">+</button>
                </div>
                <button class="remove"></button>
            </div>`
}

/**
 * 
 * @param {id:number; text:string; count:number} list 
 */

function renderListItem(list) {
    const ListDom = document.querySelector('.list');
    const ListElemDom = document.createElement('li');
    ListElemDom.dataset.id = list.id;

    ListElemDom.innerHTML = getItemTemplate(list);
    const inputCount = ListElemDom.querySelector('.control-value');
    if (+inputCount.value === 1) {
        const buttonMinus = ListElemDom.querySelector('.minus');
        buttonMinus.disabled = true;
    }

    ListDom.append(ListElemDom);
    addRemoveHandler(ListElemDom);
    addPlusHandler(ListElemDom);
    addMinusHandler(ListElemDom);
}


/**
 * @param {string} text
 */

function addItem(text) {
    const defaultCount = 1;
    const newList = {
        text: text,
        count: defaultCount
    }
    sendRequest({
        method: 'POST',
        body: newList
    })
    .then(data => data.json())
    .then((data) => {
        newList.id = data.id;
        products.push(newList);
        renderListItem(newList)
        form.reset();
    })

}

/**
 * @param {number} id
*/

function deleteItem(id) {
    return sendRequest({
        method: "DELETE",
        path: id
     })
    .then(() => {
        const deletedTodoIndex = products.findIndex(item => item.id === id);
        if (deletedTodoIndex === -1) {
            console.error("Удаляемого элемента нет в массиве :( ");
            return;
        };
        products.splice(deletedTodoIndex, 1);
    })
}

/**
 * @param {number} id 
 * @param {number} value
 */

function setCount(id,value) {
    return sendRequest({
        method: 'PUT',
        path: id,
        body: {
            count: value
        }
    })
    .then(() => {
        const item = products.find(item => item.id === id);
        if (item) {
            item.count = value;
        } else {
            console.error("Редактируемого элемента нет в массиве :( ");
        }
    })
}

/**
 * @param {Node} taskDom 
 */
const addRemoveHandler = (ListElemDom) => {
    const removeDom = ListElemDom.querySelector('.remove');
    removeDom.onclick = () => {
        const id = +ListElemDom.dataset.id;
        deleteItem(id)
        .then(() => {
            ListElemDom.remove();
        })
    }
}

/**
 * @param {Node} taskDom 
 */
const addPlusHandler = (ListElemDom) => {
    const buttonPlus = ListElemDom.querySelector('.plus');
    const inputCount = ListElemDom.querySelector('.control-value');
    const buttonMinus = ListElemDom.querySelector('.minus');
    
    buttonPlus.onclick = function() {
        let indexId = +ListElemDom.dataset.id;
        let valueCount = +inputCount.value;
        const newValue = valueCount + 1;
        setCount(indexId,newValue)
        .then(() => {
            inputCount.value = newValue;
            buttonMinus.disabled = '';
        })
    }
}

/**
 * @param {Node} taskDom 
 */
const addMinusHandler = (ListElemDom) => {
    const buttonMinus = ListElemDom.querySelector('.minus');
    const inputCount = ListElemDom.querySelector('.control-value');

    buttonMinus.onclick = function() {
        let indexId = +ListElemDom.dataset.id;
        let valueCount = +inputCount.value;
        const newValue = valueCount - 1;
        setCount(indexId,newValue)
        .then(() => {
            inputCount.value = newValue;
            if(newValue === 1) {
                buttonMinus.disabled = true;
            }
        })
    }
}

/**
 * 
 * @param {event} event 
 */
form.onsubmit = function(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const list = formData.get('list');
     
    if (list.trim()) {
        addItem(list)
    } 
}

// INIT

fetch(url)
.then(data => data.json())
.then(data => {
    for(let i=0; i<data.length; i++) {
        products.push(data[i]);
        renderListItem(data[i]);
    }
})