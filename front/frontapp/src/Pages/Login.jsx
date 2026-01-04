
import axios from "axios";
import React, { useState, useEffect } from "react";
import '../Styles/Login.css' //importing css.

const BASEURL_login = "http://127.0.0.1:8000/login";

export default function Login() {
    
    const [email,setemail] = useState("");
    const [password,setpassword] = useState("");
    const [isloged,setloger] = useState(false);

    useEffect(()=>{
        document.getElementById("loader").hidden = true; //making sure loader won't run.

    },[])

    //addresses login.
    const login_check = async (e)=>{
        e.preventDefault();
        try{
            document.getElementById("loader").hidden = false;
            const res = await axios.post(BASEURL_login,{
                email:'email',
                password:'password'
            });
        setTimeout(() => {
            alert(res.data.message)//return if login success or not.
        }, 3000);
        //window.location.href="/hello_test";
        //document.getElementById("myElementId").hidden = true;

        }
        catch(err){
            setTimeout(() => {
                 document.getElementById("loader").hidden = true;
                const errorMsg =err?.response?.data?.error || err.message || "Login Failed";
                alert(errorMsg); 
            }, 3000);
         
        }
    };


    

    return (
        <div>
            <div className="login-container">
                <div class="login-card">
                    <div class="login-header">
                         <div class = "logo">
                            <svg width ="32" height = "32" viewBox = "0 0 32 32" fill = "none">
                                <rect width = "32" height ="32" rx = "6" fill = "#635bff"/>
                                <path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h10v2H8v-2z" fill="white"/>
                            </svg>
                        </div>  
                    <h1>Sign in to Dashboard</h1>
                    <p>Welcome Back! Please sign in to continue</p>
                    </div>
                <form class="login-form" id ="LoginForm" novalidate>
                    <div class="input-group">
                        <input type="email" id = "email" name = "email" required autocomplete="email" placeholder =" "></input>
                        <label for="email">Email Address</label>
                        <span class="input-border"></span>
                        <span class="error-message" id="emailerror"></span>   
                    </div>
                    <div class="input-group">
                        <input type="password" id="password" name="password" required autocomplete="current-password" placeholder="Enter Password"></input>
                        <label for="Password">Password</label>
                        <button type="button" class="password-toggle" id= "passwordToggle" aria-label="Toggle password visbility">
                            <svg class="eye-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3C4.5 3 1.6 5.6 1 8c.6 2.4 3.5 5 7 5s6.4-2.6 7-5c-.6-2.4-3.5-5-7-5zm0 8.5A3.5 3.5 0 118 4.5a3.5 3.5 0 010 7zm0-5.5a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <span class="input-border"></span>
                    <span class="error-message" id="passwordError"></span>
                </form>
                
                <div class="form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" id="remeber" name="remember"></input>
                        <span class="checkmark">
                            <svg width="10" height="8" viewBox="0 0 10 8" fil= "none">
                                <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </span>
                        Remember Me
                    </label>
                    <a href = "#" class="forget-link">Forgot Password</a>
                    
                </div>
                <button type="sumbit" onClick={login_check} class="submit-btn" >
                    <span class="btn-text">Sign in</span>
                    <div class="bth-loader" id="loader" >
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" opacity="0.25"/>
                            <path d="M16 9a7 7 0 01-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                    <animateTransform attributeName="transform" type="rotate" dur="1s" values="0 9 9;360 9 9" repeatCount="indefinite"/>
                                </path>
                        </svg>
                    </div>
                </button>
                <div class="signup-link">
                    <span>Don't have an account</span>
                    <a href="#"> Register now!</a>
                </div>
              
                <div class="success-message" id="successMessage">
                    <div class="success-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="12" fill="none"/>
                            <path d="M8 12l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
 
                    </div>
                </div>
                </div>
                <h3>Welcome back!</h3>
                <p>Redirecting to Dashboard...</p>
            </div>
            <script src="../../shared/js/form-utils.js"></script>
            <script src="script.js"></script>
        </div>
    
    )

}