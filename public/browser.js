
function insert_task(new_ToDo)
{
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${new_ToDo.task}</span>
            <div>
              <button data-id=${new_ToDo._id} class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
              <button data-id=${new_ToDo._id} class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
          </li>`
}

// This is to generate the list items from the browser side js

let ourhtml=data.map(insert_task).join('');  // 'data' is the variable from the server side js present under the script tag
// join('') at the end of the above code is b/c the map function will return an array which will be ',' separated but we want text so...
document.getElementById('item-list').insertAdjacentHTML('beforeend',ourhtml)


let createfield=document.getElementById("create-field")



document.getElementById("create-form").addEventListener("submit",function(event){
    event.preventDefault();
    axios.post('/create-item',{task: createfield.value}).then(function(response){
        document.getElementById("item-list").insertAdjacentHTML("beforeend",insert_task(response.data))
    }).catch(function(error){
        alert('No task entered..')
    })

    createfield.value='';
    createfield.focus();

    })



    document.addEventListener("click",function(event){
    // Delete task
    if(event.target.classList.contains("delete-me"))
    {
        if(confirm("Do you really want to delete this task permanently?"))
            axios.post('/delete-task',{id: event.target.getAttribute("data-id")}).then(function(){
                event.target.parentElement.parentElement.remove()
            }).catch(function(){
                console.log("Error")
            })
    }

    
    
    // Update task
    if(event.target.classList.contains("edit-me"))  
    {                                               
        let updated_task=prompt('Give your updated task',event.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        if(updated_task)
        {
            axios.post('/update-item',{task: updated_task,id: event.target.getAttribute("data-id")}).then(function(){  
            // 'then' is executed when the axios.post is successful
            // As soon as the post request of the axios is completed this part of code will run so we are using
            // this part to display the updated to-do task
            event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = updated_task 
            }).catch(function(){
                console.log("There was an error")  // catch runs when the(axios.post() runs into some error)
            })        
        }                                      
    }
})


// This if statements means that if the targeted element 
//(i.e is storedin the 'event') contains the class (denoted by classList)
// 'edit-me' then perform the action stated. 