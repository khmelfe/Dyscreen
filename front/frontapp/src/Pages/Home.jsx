import axios from "axios";
import React, { useState, useEffect } from "react";
import   '../Styles/Home.css'
import Progress_bar from "../Components/Progressbar"
import Nav_Bar from "../Pages/Nav_Bar";
import FancySelector from "../Components/FancySelector"
const BASE_URL_UPLOAD = "http://127.0.0.1:8000/upload_file";

export default function Home() {
    const [file,setfile]= useState(null);
    const [model,setmodel] = useState("CNN_LSTM");
    const [results,setresults]= useState(null);
    const [loading,setLoading] = useState(false); //loading .
    const file_upload = (e)=>{
        //when we use onChange/onclick... the brower creates an event based on our type of input.(file in this case.)
        const fileupload = e.target.files[0];
        if(!fileupload){
            alert("Error in file uploading please try again");
            return;
        }
        setfile(fileupload);
    };

    
    const submit_file = async (e) =>{
        e.preventDefault();
        if(!file){
            //safe guard for if user didn't added a file
            alert("Please Choose a file first");
            return ;
        }
        const selectedmodel = model 
        console.log("Model selected ",selectedmodel);
        setLoading(true);
        const dataForm = new FormData()
        dataForm.append(
            "myfile",
            file,file.name,
            
        )
        dataForm.append(
            "model",selectedmodel
        )
        console.log(dataForm);
        try{
            const res = await axios.post(BASE_URL_UPLOAD,dataForm)
            console.log(res.data.prob)
            res.data.prob = (res.data.prob * 100).toFixed(4); 
            
            setresults(res);
            console.log(res.data.features.large_gap_count);
            alert("Great sucess \n ", res.pred_class);
            
            
        }

        catch(err){
            setTimeout(() => {
                const errorMsg =err?.response?.data?.error || err.message || "Upload Failed";
                alert(errorMsg); 
            }, 3000);
        }
        finally{
            setLoading(false);
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
                            <br/>
                            <p className="file-name-text">Selected: {file ? file.name : "None"}</p>
                           
                        </div>
                        
                        <button type="submit" onClick={submit_file} className="submit-btn-home">
                            <span className="btn-text">{loading ? "Analyzing..." : "Submit"}</span>
                            
                        </button>
                        
                    </div>
                                       
                     <FancySelector value={model} onChange={setmodel} />
                </div>
                
            ) : (
                <div className="results-container">
    <h1>Analysis Complete</h1>

    <div className="results-layout">
        {/* LEFT: text info */}
        <div className="results-left">
            <div className="info-top">
                <h2 className="result-label">Model Used : {model}</h2>
                <h3 className="result-label">Screening result: {results.data.label}</h3>

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

            {results.data.features && (
                <div className="features-details">
                    <h3>Detection Details</h3>
                    <p>Detected lines: {results.data.features.merged_lines.length}</p>
                    <p>Total Words: {results.data.features.total_words_found}</p>
                    <p>Words above baseline: {results.data.features.count_above_lines}</p>
                    <p>Words below baseline: {results.data.features.count_under_lines}</p>
                    <p>Word's gaps that above average user's gap :  {results.data.features.large_gap_count} </p> 
                    
                </div>
            )}
        </div>

        {/* RIGHT: two stacked image boxes */}
        <div className="results-right">
            <div className="image-box">
                <p>Features selection</p>
                {results.data.features?.annotated_url && (
                     <div 
            className="zoom-container"
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                e.currentTarget.style.setProperty("--x", `${x}%`);
                e.currentTarget.style.setProperty("--y", `${y}%`);
            }}
        >
                    <img
                        src = {results.data.features.annotated_url}
                        alt="Detected lines and word boxes"
                    />
                    </div>
                )}
                {/* Legend */}
                <p style={{ margintop:10 }}>Index</p>
    <div className="image-legend">
        
        <div className="legend-item">
            
            <span className="legend-color" style={{ borderColor: "blue" }}></span>
            <span>Word above baseline</span>
        </div>
        <div className="legend-item">
            <span className="legend-color" style={{ borderColor: "yellow" }}></span>
            <span>Word below baseline</span>
        </div>
        <div className="legend-item">
            <span className="legend-color" style={{ borderColor: "red" }}></span>
            <span>Normal word</span>
        </div>
        <div className="legend-item">
            <span className="legend-line" style={{ background: "lime" }}></span>
            <span>Detected baseline</span>
        </div>
        <div className="legend-item">
            <span className="legend-line" style={{ background: "red" }}></span>
            <span>Large word spacing</span>
        </div>
    </div>
            </div>

            <div className="image-box">
                <p>Heatmap</p>
                {/* TODO: heatmap when ready */}
                <div className="placeholder-box"
                className="zoom-container"
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.setProperty("--x", `${x}%`);
                    e.currentTarget.style.setProperty("--y", `${y}%`);
                }}>
                   
                    <img
                        src = {results.data.heatmap_url}
                        alt="Detected lines and word boxes"
                    />
                </div>

                <div className="attention-scale">
    <h3>Attention Scale</h3>
    
    <div className="scale-bar"></div>
    
    <div className="scale-labels-row">
        <span className="scale-label">1.0</span>
        <span className="scale-label">0.0</span>
    </div>
    
    <div className="scale-levels">
        <div className="level">
            <span className="level-title" style={{ color: "#ff2200" }}>Very High</span>
            <span className="level-subtitle">Strongest influence</span>
        </div>
        <div className="level">
            <span className="level-title" style={{ color: "#ff8800" }}>High</span>
            <span className="level-subtitle">Important regions</span>
        </div>
        <div className="level">
            <span className="level-title" style={{ color: "#ffff00" }}>Medium</span>
            <span className="level-subtitle">Moderate influence</span>
        </div>
        <div className="level">
            <span className="level-title" style={{ color: "#00aaff" }}>Low</span>
            <span className="level-subtitle">Lower influence</span>
        </div>
        <div className="level">
            <span className="level-title" style={{ color: "#0022ff" }}>Very Low</span>
            <span className="level-subtitle">Background / minimal</span>
        </div>
    </div>
</div>
            </div>
        </div>
    </div>

    <button onClick={handleReset} className="button-back-btn">
        Scan Another Sample
    </button>
</div>
                // /*If results*/
                // <div className="results-container">
                //     <h1>Analysis Complete</h1><br/>
                //     {/*Left side results*/}
                //     <div className="results-info-side">
                //         <h3 className="result-label">Screening results: {results.data.label}</h3>
                
                //         <div className="progress-row">
                //             <h3 className="result-label">Likelihood percentage:</h3>
                    
                //             <div className="progress-wrapper">
                //                 <Progress_bar
                //                     bgcolor={Number(results.data.prob) < 50 ? "green" : "red"}
                //                     progress={Number(results.data.prob)}
                //                     height={30}
                //                 />
                //             </div>
                //         </div>
                //     </div>
                //     {/*Right side images*/}
                //     <div className="results-images-side">
                //         <div className="image-box">
                //             <p>Features selection</p>
                //             <img
                //             src = {results.data.features.annotated_url}
                //             alt = "Detected lines and word boxes"
                //                 />
                //         </div>
                //         <div className="image-box">
                //             <p>Model Heat map</p>
                //             {/* <img src={processedImageURL} alt="Analysis" /> */}
                //         </div>
                                    
                //     </div>
                //     {results.data.features && (
                //         <div className="features-details">
                //             <h3>Detection Details</h3>
                //             <p>Detected lines: {results.data.features.merged_lines.length}</p>
                //             <p>Words above baseline: {results.data.features.count_above_lines}</p>
                //             <p>Words below baseline: {results.data.features.count_under_lines}</p>
                //         </div>
                //     )}
                //     <button onClick={handleReset} className="button-back-btn">
                //             Scan Another Sample
                //     </button>
                // </div>
            )}
        </div>
    )
}