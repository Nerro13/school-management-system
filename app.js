const express =  require("express")
const app = express()
const mysql = require("mysql")
app.set("view engine", "ejs")
//creating connection to database
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "eldohub",
})
con.connect((error)=>{
    if(error){
        console.error(error)
    }else{
        console.log("CONNECTED")
    }
})
//routes section
app.get("/home", (req,res)=>{
    res.render("home")
})
app.get("/about", (req,res)=>{
    res.render("about")
})
app.get("/sign-in", (req,res)=>{
    res.render("sign-in")
})
app.get("/sign-up", (req,res)=>{
    res.render("sign-up")
})
//post route and authentication for sign up page
app.post("/sign-up", (req,res)=>{
    con.query("SELECT * FROM students", (error, results)=>{
        if(results.email===req.body.email){
            res.render("sign-up", {error: "Email already registered"})
        }else{
            if(req.body.password===req.body.confirm_password){
                con.query("INSERT INTO students(first_name,second_name,email,password) VALUES(?,?,?,?)",
                [req.body.first_name,req.body.second_name,req.body.email,req.body.password],
                (error)=>{
                    if(error){
                        console.log(error)
                        res.status(500).render("error")
                    }else{
                        con.query("SELECT * FROM students", (error,results)=>{
                            res.render("admin", {students:results})
                        })
                    }
                })
            }
        }
    })
})
//start server and listen to port
app.listen(3000, ()=>{
    console.log("Server listening on port")
})