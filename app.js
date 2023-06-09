const express = require("express");
const session = require("express-session");
const multer = require("multer");
const app = express();
const mysql = require("mysql");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("puclic"));
app.use(express.json());
app.use(
  session({
    secret: "sern",
    resave: false,
    saveUninitialized: true,
  })
);
// multer js code
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/puclic/images/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

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
//different page logic implemented on the sign in page
// let role = con.query("SELECT role FROM students WHERE email = ?", [req.body.email])
// console.log(role)
let role = {
  admin: "admin",
  student: "student",
};
app.post("/sign-in", (req, res) => {
  con.query(
    "SELECT email FROM students WHERE email = ?",
    [req.body.email],
    (error, results) => {
      if (error) {
        res.status(500).render("error");
      } else {
        if (results.length > 0) {
          // res.render("sign-in", {error: "EMAIL NOT REGISTERED"});
          con.query(
            "SELECT role FROM students WHERE email = ?",
            [req.body.email],
            (error, results) => {
              if (error) {
                res.status(500).render("error");
              } else {
                //  console.log(results[0].role);
                //  console.log(role.admin);
                // console.log(role)
                if (results[0].role === role.admin) {
                  // res.redirect("/admin");
                  con.query(
                    "SELECT password FROM students WHERE email = ?",
                    [req.body.email],
                    (error, results) => {
                      if (error) {
                        res.status(500).render("error");
                      } else {
                        if (results[0].password === req.body.password) {
                          con.query(
                            "SELECT * FROM students WHERE role = 'student'",
                            (error, allStudents) => {
                              console.log(allStudents)
                              console.log(allStudents[0])
                              if(error){
                                res.status(500).render("error");
                              }else{
                                req.session.email = 
                                res.render("admin", {allStudents})

                              }
                              // console.log(allStudents);
                              // res.render("admin", { allStudents });
                            }
                          );
                        } else {
                          res.render("sign-in", { error: "WRONG PASSWORD" });
                        }
                      }
                    }
                  );
                } else {
                  // res.render("home");
                  if (results[0].role === role.student) {
                    con.query(
                      "SELECT password, image, first_name FROM students WHERE email = ?",
                      [req.body.email],
                      (error, results) => {
                        // console.log(results[0])
                        if (error) {
                          res.status(500).render("error");
                        } else {
                          if (results[0].password === req.body.password) {
                            res.render("users", { stud: results[0] });
                          } else {
                            res.render("sign-in", { error: "WRONG PASSWORD" });
                          }
                        }
                      }
                    );
                  }
                }
              }
            }
          );
        } else {
          res.render("sign-in", { error: "EMAIL NOT REGISTERED" });
        }
      }
    }
  );
});
app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});
//post route and authentication for sign up page
// body parser
app.post("/sign-up", upload.single("image"), (req, res) => {
  let fileType = req.file.mimetype.slice(req.file.mimetype.indexOf("/") + 1);
  const filePath =
    req.protocol +
    "://" +
    req.hostname +
    "/images/profiles/" +
    req.file.filename;
  console.log(req.body);
  con.query(
    "SELECT email FROM students WHERE email = ?",
    [req.body.email],
    (error, results) => {
      //   console.log(results);
      if (results.length > 0) {
        //check for email
        res.render("sign-up", { error: "EMAIL ALREADY REGISTERED" }); //if email exists, this it the rendered error
      } else {
        if (req.body.password === req.body.confirm_password) {
          //if email doesnt exist, moves to check password and confirm password
          //here the passwords match and it moves to insert data in the database
          con.query(
            "INSERT INTO students(user_id,first_name,second_name,email,password,role,image,image_type) VALUES(?,?,?,?,?,?,?,?)",
            [
              req.body.user_id,
              req.body.first_name,
              req.body.second_name,
              req.body.email,
              req.body.password,
              req.body.role,
              req.file.filename,
              fileType,
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
          res.render("sign-up", { error: "PASSWORDS DO NOT MATCH" });
        }
      }
    }
  );
});
let students = "";
app.get("/admin", (req, res) => {
  con.query("SELECT * FROM students WHERE role = 'admin'", (error, results) => {
    if (error) {
      res.status(500).render("error");
    } else {
      res.render("admin", { students: results });
    }
  });
});
app.post("/deleteuser/:id", (req, res) => {
  con.query(
    "DELETE FROM students WHERE email = ?",
    [req.params.id],
    (error) => {
      if (error) {
        res.status(500).render("error");
      } else {
        res.redirect("/admin");
      }
    }
  );
});
app.get("/register", (req, res)=>{
  res.render("register")
})
app.post("/register", (req,res)=>{
  con.query("INSERT INTO courses (course_code, course_name,category) VALUES (?,?,?)", [req.body.course_code, req.body.course_name, req.body.category], (error)=>{
    if(error){
      res.status(500).render("register", {error: "SOMETHING WENT WRONG"})
    }else{
      con.query("SELECT * FROM courses WHERE ")
    }
  })
})

//start server and listen to port
app.listen(3000, () => {
  console.log("Server listening on port");
});
