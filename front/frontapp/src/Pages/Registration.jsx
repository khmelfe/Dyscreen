import axios from "axios";
import React, { useState, useEffect } from "react";
import   '../Styles/Registration.css'
import Progress_bar from "../Components/Progressbar"

const BASE_URL_Registration = "http://127.0.0.1:8000/";

  function htmlspecialchars(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
        }

export default function Registration() {
    
    const [username,setusername] = useState("");
    const [password,setpassword] = useState("");
    const [email,setemail] = useState("");
    
    const checkusername = (username) =>  {
        const username_Check = username.target.value;
        console.log(username.target.value);
        if((username_Check.charAt(0) >= 'a' && username_Check.charAt(0) <= 'z') ||  (username_Check.charAt(0) >= 'A' && username_Check.charAt(0) <= 'Z')){
                setusername(username_Check); //avoid xss attacks.

            }
        else{
             document.getElementById("username_error").style.visibility="visible";

        }
        }


    //outblur check  
    const handlepassword =  () => {
        const regex = /[^A-Za-z0-9$!@&]/;
        //make sure that we got a chars and 
        const password_check = htmlspecialchars(document.getElement("password")); // make the id as a password.
        if(password_check.length() >= 8 && password_check.length() <=16){
            if(regex.test(password_check) ){
                setpassword(password_check)// add the password.
            }
        }
    };

    // const handleconfiorm_password () => {
    //     if(password !== htmlspecialchars(document.getElement("conformpassword")) // make the id as a password.

    //    )
    // };

    const registratoin = async (e) => {
        e.preventDefault();
        try {
        checkusername(username);
        const dataform = new FormData()
        dataform.append("username",username);
        dataform.append("password",password);
        dataform.append("email",email);
        
        
        //waiting server response.
       
            //start animation.
            const res = await axios.post(BASE_URL_Registration,dataform);
            alert("Registartion completed \n");
            //end animatoin.
            window.locatoin.href = "Login.jsx"
        } catch (err) {
            const errorMsg =err?.response?.data?.error || err.message || "Upload Failed";
            alert(errorMsg);
            
        }
    }
  
    
    return (
        
        <div className="Registration-div">
            {/* <div className="flip-card">
                <div className = "flip-card-inner">
                        <div className = "flip-card-front">
                            <h1>Front side</h1>
                        </div>
                        
                        <div className="flip-card-back">
                            <h1> Jone Doe</h1>
                            <p>Architect & Enginner</p>
                        </div>
                    </div>
            </div> */}
            <div className="regform">
                <h1 >Welcome to Registratoin :</h1>
                <p>Please enter the fields below to Sign Up </p>
                <br/>
                <form className="form-style">
                    <div class="input-username">
                    <label for= "username"> Enter Username : </label>
                    <br/>
                    <input type="text" placeholder="Username"  onBlur={checkusername} required ></input>
                    <br/>
                    <span className="error-message-username" id="username_error" style={{visibility:"hidden"}} >Username Needs to start with alpaptic word. </span>
                    <br/>
                    <label for="password"  title="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters">Enter Password </label> 
                    <br/>
                    <input type="password" placeholder ="Password" required ></input>
                    <br/>

                    <label for="email" > Enter Email :</label>
                    <br/>
                    <input type="email" placeholder="Email" required></input>
                    <br/>
                </div>
                    <button type="sumbit"  class="submit-btn" >
                    <span class="btn-text">Submit</span>
                
                </button>
                    <label for="submission" ></label>
                </form>
            </div>
        </div>
    )
}

