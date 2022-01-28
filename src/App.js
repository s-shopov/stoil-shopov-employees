import logo from "./logo.svg";
import React, { useState } from "react";
import Papa from "papaparse";

import "./App.css";
import { Box, Container, VStack } from "@chakra-ui/react";
import Header from "./components/Header";
import { DataTable } from "./components/Table";
import FileUploader from "./components/FileUploader";
function App() {
  const data = React.useMemo(
    () => [
      {
        empID1: "Hello",
        empID2: "World",
        projectID: "1",
        days: "15",
      },

      {
        empID1: "react-table",
        empID2: "rocks",
        projectID: "1",
        days: "15",
      },

      {
        empID1: "whatever",
        empID2: "you want",
        projectID: "1",
        days: "15",
      },
    ],

    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Employee ID #1",
        accessor: "employeeOne.EmpID", // accessor is the "key" in the data
      },
      {
        Header: "Employee ID #2",
        accessor: "employeeTwo.EmpID",
      },
      {
        Header: "Project ID",
        accessor: "project",
      },
      {
        Header: "Days worked",
        accessor: "days",
      },
    ],

    []
  );
  const [parsedCsvData, setParsedCsvData] = useState([]);
  const [dataLoaded, setLoadedData] = useState(false);

  const prepareData = (data) => {
    const parsed = [];
    for (let i = 0; i < data.length; i++) {
      if (parsed[data[i].ProjectID] === undefined) {
        parsed[data[i].ProjectID] = [];
      }
      parsed[data[i].ProjectID].push(data[i]);
    }
    
    let days = 0;
    let project = {};
    const tableData = [];
    parsed.forEach((el) => {
      if (el.length >= 2) {
        for (let i = 0; i < el.length - 1; i++) {
          for (let j = i + 1; j < el.length; j++) {
            let workedDays = calcDays([el[i], el[j]]);
            if (workedDays > days) {
              days = workedDays;

              project = prepareDataObject(el[i], el[j], days);
              tableData.push(project);              
            }
          }
        }
      }
    });
    setParsedCsvData(tableData);
    tableData.length > 0 ? setLoadedData(true) : setLoadedData(false);
   
  };
  const prepareDataObject = (employeeOne, employeeTwo, days = 0) => {
    return {
        project:employeeOne.ProjectID, // there is no diffrence 
        days: days,
        employeeOne: employeeOne,
        employeeTwo: employeeTwo,
    }
  }
  const getCSVData = (data) => {
    prepareData(data);
  };
  const calcDays = (data) => {
    let daysWorked = 0;
    data.forEach((employee) => {
      const dateFrom = new Date(JustADate(employee.DateFrom)),
        dateTo = new Date(JustADate(employee.DateTo)),
        diffTime = Math.abs(dateTo - dateFrom),
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysWorked += diffDays;

    });
    return daysWorked;
  };
  function JustADate(initDate){
    var utcMidnightDateObj = null
    // if no date supplied, use Now.
    if(!initDate)
      initDate = new Date();
  
    // if initDate specifies a timezone offset, or is already UTC, just keep the date part, reflecting the date _in that timezone_
    if(typeof initDate === "string" && initDate.match(/((\+|-)\d{2}:\d{2}|Z)$/gm)){  
       utcMidnightDateObj = new Date( initDate.substring(0,10) + 'T00:00:00Z');
    } else {
      // if init date is not already a date object, feed it to the date constructor.
      if(!(initDate instanceof Date))
        initDate = new Date(initDate);
        // Vital Step! Strip time part. Create UTC midnight dateObj according to local timezone.
        utcMidnightDateObj = new Date(Date.UTC(initDate.getFullYear(),initDate.getMonth(), initDate.getDate()));
    }
  
    return {
      toISOString:()=>utcMidnightDateObj.toISOString(),
      getUTCDate:()=>utcMidnightDateObj.getUTCDate(),
      getUTCDay:()=>utcMidnightDateObj.getUTCDay(),
      getUTCFullYear:()=>utcMidnightDateObj.getUTCFullYear(),
      getUTCMonth:()=>utcMidnightDateObj.getUTCMonth(),
      setUTCDate:(arg)=>utcMidnightDateObj.setUTCDate(arg),
      setUTCFullYear:(arg)=>utcMidnightDateObj.setUTCFullYear(arg),
      setUTCMonth:(arg)=>utcMidnightDateObj.setUTCMonth(arg),
      addDays:(days)=>{
        utcMidnightDateObj.setUTCDate(utcMidnightDateObj.getUTCDate + days)
      },
      toString:()=>utcMidnightDateObj.toString(),
      toLocaleDateString:(locale,options)=>{
        options = options || {};
        options.timeZone = "UTC";
        locale = locale || "en-EN";
        return utcMidnightDateObj.toLocaleDateString(locale,options)
      }
    }
  }
  const handleFile = async (file) => {
    Papa.parse(file, {
      delimiter: ",",
      header: true,
      keepEmptyRows: false,
      skipEmptyLines: "greedy",
      complete: (results) => {
        getCSVData(results.data);
      },
    });
  };
  const ShowTable = () => {
    if (dataLoaded) {
      return <DataTable data={parsedCsvData} columns={columns} />;
    } else {
      
      return <Box>Please load file first!</Box>;
    }
  };
  return (
    <Container maxW="container.xl"  border='1px' borderColor='gray.200'>
      <Header />

      <VStack py={100}>
        <FileUploader handleFile={handleFile} />
        <ShowTable />
      </VStack>
    </Container>
  );
}

export default App;
