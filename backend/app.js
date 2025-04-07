const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const exhbs = require('express-handlebars');
const dbo = require('./db');
const obid = dbo.obid;
const cors = require('cors');



app.engine('hbs',exhbs.engine({layoutsDir:'mongo/',defaultLayout:'main',extname:"hbs"}));
app.set("view engine","hbs");
app.set('views','mongo');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

const corsOptions = {
    origin: "http://localhost:3000", // Replace with your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));


app.get('/', async (req, res) => {
    try {
        let database = await dbo.getDatabase();
        const collection = database.collection('Tasks');
        const tasks = await collection.find({}).toArray();

        // Handle API requests (JSON response)
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(200).json(tasks);
        }

        // Variables for HTML rendering
        let message = "";
        let edit_id, edit_Tasks;

        // Handle edit query
        if (req.query.edit_id) {
            edit_id = req.query.edit_id;
            edit_Tasks = await collection.findOne({ _id: new obid(edit_id) });
        }

        // Handle delete query
        if (req.query.delete_id) {
            const delete_id = req.query.delete_id;
            await collection.deleteOne({ _id: new obid(delete_id) });
            return res.redirect("/?status=3");
        }

        // Handle status messages
        switch (req.query.status) {
            case '1':
                message = "Inserted successfully";
                break;
            case '2':
                message = "Updated successfully";
                break;
            case '3':
                message = "Deleted successfully";
                break;
            default:
                break;
        }

        // Render the HTML view
        res.render('main', { message, tasks, edit_Tasks, edit_id });

    } catch (error) {
        console.error("Error in GET / route:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/store_title',async (req,res)=>{
    let database=await dbo.getDatabase();
    const collection = database.collection('Tasks');
    let Tasks={title: req.body.title,description: req.body.description};
    await collection.insertOne(Tasks);
    return res.redirect('/?status=1');
})
app.post('/update_title/:edit_id',async (req,res)=>{
    let database=await dbo.getDatabase();
    const collection = database.collection('Tasks');
    let Tasks={title: req.body.title,description: req.body.description};
    await collection.updateOne({ _id: new obid(req.params.edit_id) }, { $set: Tasks });

    return res.redirect('/?status=2');
})
app.listen(8000,()=>{
    console.log('listening to 8000 port');
})

// // For frontend requests, send JSON
/*if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(200).json(tasks);
}*/