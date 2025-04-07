import {useEffect,useState} from "react"


export default function Todo(){
    const [title,setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [todos, setTodos] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(-1);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDesciption] = useState("");
    const apiUrl = "http://localhost:8000"


    


    const handleSubmit=()=>{
        setError("");
        if (title.trim() !=="" && description.trim() !==""){
            fetch(apiUrl+'/store_title', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description }),
            })
            .then((res) => {
                if (res.ok) {
                    setTodos([...todos, { title, description }]);
                    setMessage("Item added successfully");
                    setTimeout(()=>{
                        setMessage("");
                    },3000)
                } else {
                    throw new Error("Unable to create Todo item");
                }
            })
            .catch((err) => {
                setError(err.message);
            });
            
        }
        
    }
    useEffect(()=>{
        getItems()
    },[])

    const handleEdit = (item) => {
        setEditId(item._id); 
        setEditTitle(item.title); 
        setEditDesciption(item.description)
    }

    const getItems = () => {
        fetch(apiUrl+"/",{
            headers: {
                'Accept': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Data fetched:", data);
                setTodos(data);
            })
            .catch((error) => {
                console.error("Error in fetch:", error);
            });
        
    };

    const handleUpdate = () => {
        setError("")
        //check inputs
        if (editTitle.trim() !== '' && editDescription.trim() !== '') {
            fetch(apiUrl+"/update_title/"+editId, {
                method: "POST",
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({title: editTitle, description: editDescription})
            }).then((res) => {
                if (res.ok) {
                    //update item to list
                    const updatedTodos = todos.map((item) => {
                        if (item._id === editId) {
                            item.title = editTitle;
                            item.description = editDescription;
                        }
                        return item;
                    })

                    setTodos(updatedTodos)
                    setEditTitle("");
                    setEditDesciption("")
                    setMessage("Item updated successfully")
                    setTimeout(() => {
                        setMessage("");
                    },3000)

                    setEditId(-1)
    
                }else {
                    //set error
                    setError("Unable to create Todo item")
                }
            }).catch(() => {
                setError("Unable to create Todo item")
            })
        }
    }

    const handleEditCancel = () => {
        setEditId(-1)
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure want to delete?')) {
            fetch(apiUrl+'/'+id, {
                method: "DELETE"
            })
            .then(() => {
               const updatedTodos = todos.filter((item) => item._id !== id)
               setTodos(updatedTodos)
            })
        }
    }
    
    return  <>
    <div className="row p-3 bg-success text-light">
        <h1>Organizo</h1>
    </div>
    <div className="row">
        <h3>Add task</h3>
        {message && <p className ="text-success">{message}</p>}
        <div className="form-group d-flex gap-2">
            <input placeholder="Title" onChange={(e)=>setTitle(e.target.value)} value={title} className="form-control" type="text" />
            <input placeholder="Description" onChange={(e)=>setDescription(e.target.value)} value={description} className="form-control" type="text" />
            <button className="btn btn-dark" onClick={handleSubmit} >Submit</button>  

        </div>
        {error && <p>{error}</p>}
    </div>
    <div className="row mt-3">
        <h3>Tasks</h3>
        <ul className="list-group">
            {
                todos.map((item) =>  <li className="list-group-item bg-info d-flex justify-content-between align-items-center my-2">
                    <div className="d-flex flex-column">
                   
                        {
                            editId === -1 || editId !==  item._id ? <>
                                <span className="fw-bold">{item.title}</span>
                                <span>{item.description}</span>
                            </> : <>
                            <div className="form-group d-flex gap-2">
                                <input placeholder="Title" onChange={(e) => setEditTitle(e.target.value)} value={editTitle} className="form-control" type="text" />
                                <input placeholder="Description" onChange={(e) => setEditDesciption(e.target.value)} value={editDescription} className="form-control" type="text" />
                            </div>
                            </>
                        }    
                    </div>
                    <div className="d-flex gap-2">
                    { editId === -1 ?<button className="btn btn-warning" onClick={() => handleEdit(item)} >Edit</button>:<button className="btn btn-warning" onClick={handleUpdate} >Update</button>}
                    { editId === -1 ? <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button> :
                        <button className="btn btn-danger" onClick={handleEditCancel}>Cancel</button> }
                     
                    </div>
                </li>) }
            
        </ul>
            
    </div>
    </>
}