import axios from "axios";
import React, { useState, useEffect } from "react";
import   '../Styles/Home.css'
import Progress_bar from "../Components/Progressbar"
import Nav_Bar from "../Pages/Nav_Bar";
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
                {/* <header className="header">
                    <h1>Dyscreen</h1>
                </header> */}
            </div>
            <div className = "content">
                <h1>Welcome to DyScreen</h1>
                <p>We utilize advanced Deep Learning models to help identify learning differences across all age groups. <br/> Early screening is the first step toward personalized support and academic success.</p>
                <br/>
                <p>Prepare your file: Take a clear photo or scan of a handwritten Hebrew sample. <br/> Upload: Click the button below to upload your PDF or Image (JPG/PNG).<br/> Analyze: Our model will process the sample to provide instant feedback.</p>
            </div>
            {/* <div>
           <input type="file" onChange={file_upload} id="fileUpload" class="file-input" hidden />

            <label for="fileUpload" class="button">
                Choose File
            </label>
            </div>
           <button type="sumbit" onClick={submit_file} class="submit-btn" >
                    <span class="btn-text">Submit</span>
                   
            </button>
            <div>
                <label for="uploaded_file">Choose File{file ? file.name : "None" }</label>
            </div> */}

            <div className="button-row">
                <div className="input-wrapper">
                    <input type="file" onChange={file_upload} id="fileUpload" className="file-input" hidden />
                    <label htmlFor="fileUpload" className="button">
                        Choose File
                    </label>
                    {/* Shows file name right under the choose button */}
                    <p className="file-name-text">Selected: {file ? file.name : "None"}</p>
                </div>

                <button type="submit" onClick={submit_file} className="submit-btn-home">
                    <span className="btn-text">Submit</span>
                </button>
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