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
    };

    // Helper to reset the view
    const handleReset = () => {
        setresults(null);
        setfile(null);
    };
    
    return(
        <div className="home-page-container">

            {/*If no results*/}
            {!results ? (
                <div className="no-results-container">
                    <div className = "content">
                        <h1>Welcome to DyScreen</h1>
                        <p>We utilize advanced Deep Learning models to help identify learning differences across all age groups. <br/> Early screening is the first step toward personalized support and academic success.</p>
                        <br/>
                        <h3>Steps:</h3>
                        <p>Prepare your file: Take a clear photo or scan of a handwritten Hebrew sample. <br/> Upload: Click the button below to upload your PDF or Image (JPG/PNG).<br/> Analyze: Our model will process the sample to provide instant feedback.</p>
                    </div>

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
                </div>
            ) : (
                /*If results*/
                <div className="results-container">
                    <h1>Analysis Complete</h1><br/>
                    {/*Left side results*/}
                    <div className="results-info-side">
                        <h3 className="result-label">Screening results: {results.data.label}</h3>
                
                        <div className="progress-row">
                            <h3 className="result-label">Likelihood percentage:</h3>
                    
                            <div className="progress-wrapper">
                                <Progress_bar
                                    bgcolor={Number(results.data.prob) < 50 ? "green" : "red"}
                                    progress={Number(results.data.prob)}
                                    height={30}
                                />
                            </div>
                        </div>
                    </div>
                    {/*Right side images*/}
                    <div className="results-images-side">
                        <div className="image-box">
                            <p>Features selection</p>
                            {/* <img src={fileURL} alt="Handwriting Sample" /> */}
                        </div>
                        <div className="image-box">
                            <p>Model Heat map</p>
                            {/* <img src={processedImageURL} alt="Analysis" /> */}
                        </div>
                    </div>
                    
                    <button onClick={handleReset} className="button-back-btn">
                            Scan Another Sample
                    </button>
                </div>
            )}
        </div>
    )
}