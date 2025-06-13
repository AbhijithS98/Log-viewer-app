import { useState,useEffect } from "react"
import FileUploader from "../components/FileUploader";
import LogTable from "../components/LogTable";
import FilterSearch from "../components/FilterSearch";

const Home = () => {
  const [limit,setLimit] = useState(20);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  
  useEffect(()=>{
    console.log("parsed logs:", logs);
  }, [logs]);

  const handleParsedLogs = (data) => {
  setLogs(data);
  setFilteredLogs(data);
  };

  const handleFilterApply = ({ tags, exTags, level, exLevel, logic, searchText }) => {
  if (!tags && !exTags && !level && !exLevel && !searchText) return setFilteredLogs(logs);

  const filtered = logs.filter((log) => {
    const logTags = (log.tags || []).map((t) => t.toLowerCase());
    const logLevel = (log.level || "").toLowerCase();
    const msg = typeof log.message === "string"
  ? log.message.toLowerCase()
  : JSON.stringify(log.message || "").toLowerCase();

    // Tag filtering
    let tagMatch = true;
    tagMatch =
      logic === "OR"
        ? tags?.some((t) => logTags.includes(t))
        : tags?.every((t) => logTags.includes(t)) 
    
    // ExTag filtering
    let exTagMatch = true;
    if(exTags) exTagMatch = exTags.every((t) => !logTags.includes(t));    
    
    // Level filtering
    let levelMatch = true;
    if (level) levelMatch = logLevel === level;

    // exLevel filtering
    let exLevelMatch = true;
    if (exLevel) exLevelMatch = logLevel !== exLevel;

    // Message search
    const searchMatch = searchText ? msg.includes(searchText) : true;

    return tagMatch && exTagMatch && levelMatch && exLevelMatch && searchMatch;
  });

  setFilteredLogs(filtered);
  };


  const handleExport = () => {
  const logsToExport = filteredLogs; 

  const logText = logsToExport.map(log => JSON.stringify(log)).join("\n");

  const blob = new Blob([logText], {
    type: "text/plain",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `logs-${new Date().toISOString()}.log`;
  a.click();

  URL.revokeObjectURL(url);
  };


  return (
    <>
    <div className="m-4 flex justify-between">
      <h1 className="text-2xl font-semibold">Parsed Log File Entries</h1>
      <FileUploader onParsed={handleParsedLogs} setLimit={setLimit}/>
    </div>
    
    {logs.length > 0 && <div>
      <span className="m-4 font-bold text-blue-500">{filteredLogs.length} logs found</span>
      <div className="flex justify-between items-center pr-4">
        <FilterSearch onApply={handleFilterApply}/>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded text-md whitespace-nowrap"
          >
          Export Logs
        </button>
      </div>    
    </div>}

    <div>
      <LogTable logs={filteredLogs} limit={limit} setLimit={setLimit}/>
    </div>
    </>
  )
}

export default Home
