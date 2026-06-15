
import { useState,useEffect } from "react";
import { SubmissionPage } from "./Components/new_design/SubmissionPage.jsx";
import { ResultsPage } from "./Components/new_design/ResultsPage.jsx";
import { LandingPage } from "./Components/new_design/LandingPage.jsx";
import axios from "axios";

const BASE_URL_Delete =  "http://localhost:8000/upload_file"






export default function App() {
  const [page, setPage] = useState("submit");
  const [darkMode, setDarkMode] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null); //security.

  const handleAnalyze = () => {
    setPage("processing");
    return new Promise((resolve) => {
      setTimeout(resolve, 4200);
    });
  };


useEffect(() => {
    axios.get("http://localhost:8000/csrf/", { withCredentials: true })
        .then(res => setCsrfToken(res.data.csrfToken));
    console.log(csrfToken);  // ← read from body, not cookie
}, []);



function getCsrfToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}
  

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    console.log(result);
    setPage("results");
  };

  const handleNewAnalysis = () => {
    console.log("New Analysis", analysisResult);
    //Adding API to remove the last analysis, 
    removing_files(analysisResult);
    setAnalysisResult(null);
    setPage("submit");
  };

  const removing_files = (old_analysis) =>{
    //Removing data.
    const dataform = new FormData();
    const photo_url = old_analysis.data.features.annotated_url;
    const heatmap_url = old_analysis.data.heatmap_url;
    const OG = old_analysis.data.Orignal_photo;
    dataform.append("photo",photo_url);
    dataform.append("heatmap",heatmap_url);
    dataform.append("OG",OG);
    try{
axios.delete(BASE_URL_Delete, {
    data: dataform,
    headers: { "X-CSRFToken": csrfToken },
    withCredentials: true
})

    console.log("Files were deleted Succesfully");
    }
    catch(err){
      console.log("Problem has arised while deleting",err);
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div
        className="min-h-screen bg-background text-foreground"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {page === "submit" || page === "processing" ? (
          <SubmissionPage
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)}
            onAnalyze={handleAnalyze}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisFailed={handleNewAnalysis}
            processing={page === "processing"}
            csrfToken={csrfToken}
          />
        ) : (
          <ResultsPage
            result={analysisResult}
            darkMode={darkMode}
            onToggleDark={() => setDarkMode(!darkMode)}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </div>
    </div>
  );
}
