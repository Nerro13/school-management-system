const express = require("express");
const app = express();
const mysql = require("mysql");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('puclic'))
//creating connection to database
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "eldohub",
});
con.connect((error) => {
  if (error) {
    console.error(error);
  } else {
    console.log("CONNECTED");
  }
});
//routes section
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/sign-in", (req, res) => {
  res.render("sign-in");
});
app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});
//post route and authentication for sign up page
// body parser
app.post("/sign-up", (req, res) => {
  console.log(req.body);
  con.query(
    "SELECT email FROM students WHERE email = ?",
    [req.body.email],
    (error, results) => {
      //   console.log(results);
      if (results.length > 0) {
        //check for email
        res.render("sign-up", { error: "Email already registered" }); //if email exists, this it the rendered error
      } else {
        if (req.body.password === req.body.confirm_password) {
          //if email doesnt exist, moves to check password and confirm password
          //here the passwords match and it moves to insert data in the database
          con.query(
            "INSERT INTO students(first_name,second_name,email,password) VALUES(?,?,?,?)",
            [
              req.body.first_name,
              req.body.second_name,
              req.body.email,
              req.body.password,
            ],
            (error) => {
              //while inserting data, check for errors
              if (error) {
                //if error then render sign up form with an error message
                console.log(error);
                res.status(500).render("error");
              } else {
                //if theres no error, render the sign in form
                res.render("sign-in");
                console.log("Successful");
              }
            }
          );
        } else {
          // res.render("sign-up", { error: "Passwords do not match" });
          res.render("sign-up", { error: "Passwords do not match" });
        }
      }
    }
  );
});
app.post("/admin", (req,res)=>{
  con.query("SELECT first_name,second_name,email FROM students", (error,results)=>{
    if(error){
      res.status(500).render("error")
    }else{
      res.render("admin", {students:results})
    }
  })
})
//start server and listen to port
app.listen(3000, () => {
  console.log("Server listening on port");
});
