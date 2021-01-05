const form = document.querySelector('.createListForm');
const buttonPlus = document.querySelector('.plus');
const buttonMinus = document.querySelector('.minus');

console.log(buttonMinus);

const lis = [];
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
 * @param {{id:number; text:string; count:numder;}} list
 */

function getListTemplate(list) {
    return `<div class="content">
                <input type="text" disabled value="${list.text}" class="ListkInput"/>
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

function renderList(list) {
    const ListDom = document.querySelector('.list');
    const ListElemDom = document.createElement('li');
    ListElemDom.dataset.id = list.id;

    ListElemDom.innerHTML = getListTemplate(list);
    ListDom.append(ListElemDom);
    addRemoveHandler(ListElemDom);
}


/**
 * @param {string} text
 */

function addList(text) {
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
        lis.push(newList);
        renderList(newList)
        form.reset();
    })

}

/**
 * @param {number} id
*/

function deleteList(id) {
    return sendRequest({
        method: "DELETE",
        path: id
     })
    .then(() => {
        const deletedTodoIndex = lis.findIndex(item => item.id === id);
        if (deletedTodoIndex === -1) {
            console.error("Удаляемого элемента нет в массиве :( ");
            return;
        };
        lis.splice(deletedTodoIndex, 1);
    })
}

/**
 * @param {number} id 
 * @param {number} value
 */

function setCount(id,value) {
    sendRequest({
        method: 'PUT',
        path: id,
        body: {
            count: value
        }
    })
    .then(() => {
        const list = lis.find(item => item.id === id);
        if (todo) {
            todo.count = value;
        } else {
            console.error("Редактируемого элемента нет в массиве :( ");
        }
    })
}

/**
 * 
 * @param {Node} taskDom 
 */
const addRemoveHandler = (ListElemDom) => {
    const removeDom = ListElemDom.querySelector('.remove');
    removeDom.onclick = () => {
        const id = +ListElemDom.dataset.id;
        deleteList(id)
        .then(() => {
            ListElemDom.remove();
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
        addList(list)
    } 
}

buttonPlus.onclick = () => {
    debugger;
    const ListDom = document.querySelector('.list');
    const ListElemDom = ListDom.querySelector('li')
    const inputCount = ListElemDom.querySelector('.control-value');

    let indexId = ListElemDom.dataset.id;
    let valueCount = +inputCount.value;

    sendRequest(indexId,valueCount)
    .then(() => {
        valueCount++;
    })
}

buttonMinus.onclick = () => {
    const ListDom = document.querySelector('.list');
    const ListElemDom = ListDom.querySelector('li')
    const inputCount = ListElemDom.querySelector('.control-value');

    let indexId = ListElemDom.dataset.id;
    let valueCount = +inputCount.value;

    sendRequest(indexId,valueCount)
    .then(() => {
        if(valueCount === 1) {
            buttonMinus.disabled = 'true';
        }else {
            valueCount--;
        }
       
    })
}


// INIT

fetch(url)
.then(data => data.json())