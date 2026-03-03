import axios from "axios";
import React, { useState, useEffect } from "react";
import   '../Styles/Home.css'
import Progress_bar from "../Components/Progressbar"
const BASE_URL_UPLOAD = "http://127.0.0.1:8000/upload_file";

export default function Home() {
    const [file,setfile]= useState(null);
    const [results,setresults]= useState(null);
     
    const file_upload = (e)=>{
        //when we use onChange/onclick... the brower creates an event based on our type of input.(file in this case.)
        const fileupload = e.target.files[0];
        if(!fileupload){
            alert("Error in file uploading please try again");
            return;
        }
        setfile(fileupload);
    };

    //we
    const submit_file = async (e) =>{
        e.preventDefault();
        const dataForm = new FormData()
        dataForm.append(
            "myfile",
            file,file.name
        )
        try{
            const res = await axios.post(BASE_URL_UPLOAD,dataForm)
            console.log(res.data.prob)
            res.data.prob = (res.data.prob * 100).toFixed(4); 
            
            setresults(res);

            alert("Great sucess \n ", res.pred_class);
        }

        catch(err){
            setTimeout(() => {
                const errorMsg =err?.response?.data?.error || err.message || "Upload Failed";
                alert(errorMsg); 
            }, 3000);
        }
    }
    
    return(
        <div>
            <div className= "headerarea">
                <header className="header">
                    <h1>Dyscreen</h1>
                </header>
            </div>
            <div className = "content">
                <h1>Welcome to our site!</h1>
                <p>Please upload a file to the system so we could examine it!</p>
            </div>
            <div>
           <input type="file" onChange={file_upload} id="fileUpload" class="file-input" hidden />

            <label for="fileUpload" class="button">
                Choose File
            </label>
            </div>
           <button type="sumbit" onClick={submit_file} class="submit-btn" >
                    <span class="btn-text">Submit</span>
                   
            </button>
            <div>
                <label for="uploaded_file">Uploaded file : {file ? file.name : "None" }</label>
            </div>
            <div>
                <h3 for= "results"> Model results: {results? results.data.label : "None"} </h3> 
                <br/>
                
                <h3 for= "results"> Likelihood of Dyslexia :  </h3> 
                <br/>
                
             {results && results.data.prob < 50 && (
                <Progress_bar
                bgcolor="green"
                progress= {Number(results.data.prob)  }
                height={30}
            />)
            }
             {results && results.data.prob > 50 && (
                <Progress_bar
                bgcolor="red"
                progress= {Number(results.data.prob) }
                height={30}
            />)
            }
            </div>
            </div>
    )
}