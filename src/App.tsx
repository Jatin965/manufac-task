import React, { useState, useEffect } from "react";
import { Table } from "@mantine/core";
import "./App.css";
import data from "./assets/data/Manufac_India_Agro_Dataset.json";

// Define the CropData interface to represent the structure of the data in the JSON file
interface CropData {
  Country: string;
  Year: string;
  "Crop Name": string;
  "Crop Production (UOM:t(Tonnes))": string;
  "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": string;
  "Area Under Cultivation (UOM:Ha(Hectares))": string;
}

// Define interfaces for the structure of rows in the two tables
interface Table1Row {
  year: string;
  maxCrop: string;
  minCrop: string;
}

interface Table2Row {
  crop: string;
  avgYield: string;
  avgArea: string;
}

const App: React.FC = () => {
  // State to hold the data for the two tables
  const [table1, setTable1] = useState<Table1Row[]>([]);
  const [table2, setTable2] = useState<Table2Row[]>([]);

  // useEffect hook to process data when the component mounts
  useEffect(() => {
    const processedData = processData(data as CropData[]);
    setTable1(processedData.table1);
    setTable2(processedData.table2);
  }, []);

  // Function to process the data and generate the table data
  const processData = (
    data: CropData[]
  ): { table1: Table1Row[]; table2: Table2Row[] } => {
    // Maps to hold intermediate calculations
    const yearMap = new Map<
      string,
      {
        maxCrop: string;
        minCrop: string;
        maxProduction: number;
        minProduction: number;
      }
    >();
    const cropMap = new Map<
      string,
      { totalYield: number; totalArea: number; count: number }
    >();

    // Iterate through each data entry
    data.forEach((entry) => {
      const year = entry["Year"].split(", ")[1];
      const crop = entry["Crop Name"];
      const production = parseFloat(entry["Crop Production (UOM:t(Tonnes))"]) || 0;
      const yieldOfCrops =
        parseFloat(entry["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]) || 0;
      const areaUnderCultivation =
        parseFloat(entry["Area Under Cultivation (UOM:Ha(Hectares))"]) || 0;

      // Process year-wise data for Table 1
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          maxCrop: crop,
          minCrop: crop,
          maxProduction: production,
          minProduction: production,
        });
      } else {
        const yearData = yearMap.get(year)!;
        if (production > yearData.maxProduction) {
          yearData.maxCrop = crop;
          yearData.maxProduction = production;
        }
        if (production < yearData.minProduction) {
          yearData.minCrop = crop;
          yearData.minProduction = production;
        }
        yearMap.set(year, yearData);
      }

      // Process crop-wise data for Table 2
      if (!cropMap.has(crop)) {
        cropMap.set(crop, {
          totalYield: yieldOfCrops,
          totalArea: areaUnderCultivation,
          count: 1,
        });
      } else {
        const cropData = cropMap.get(crop)!;
        cropData.totalYield += yieldOfCrops;
        cropData.totalArea += areaUnderCultivation;
        cropData.count += 1;
        cropMap.set(crop, cropData);
      }
    });

    // Generate data for Table 1
    const table1: Table1Row[] = [];
    yearMap.forEach((value, key) => {
      table1.push({ year: key, maxCrop: value.maxCrop, minCrop: value.minCrop });
    });

    // Generate data for Table 2
    const table2: Table2Row[] = [];
    cropMap.forEach((value, key) => {
      table2.push({
        crop: key,
        avgYield: (value.totalYield / value.count).toFixed(3),
        avgArea: (value.totalArea / value.count).toFixed(3),
      });
    });

    return { table1, table2 };
  };

  // Function to render a table using the data and headers provided
  const renderTable = (data: (Table1Row | Table2Row)[], headers: string[]) => (
    <Table.ScrollContainer minWidth={300} style={{ height: "665px" }}>
      <Table
        striped
        highlightOnHover
        withTableBorder
        horizontalSpacing="md"
        verticalSpacing="sm"
      >
        <Table.Thead>
          <Table.Tr>
            {headers.map((header, index) => (
              <Table.Th key={index}>{header}</Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((row, index) => (
            <Table.Tr key={index}>
              {Object.values(row).map((cell, cellIndex) => (
                <Table.Td key={cellIndex}>{cell}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );

  // Return the JSX to render the two tables
  return (
    <div className="app-dashboard">
      <div className="container">
        <div className="table-row">
          <div className="table-container">
            <h4>Table 1: Crop Production Analysis by Year</h4>
            {renderTable(table1, [
              "Year",
              "Crop with Maximum Production",
              "Crop with Minimum Production",
            ])}
          </div>
          <div className="table-container">
            <h4>Table 2: Average Yield and Cultivation Area of Crops (1950-2020)</h4>
            {renderTable(table2, [
              "Crop",
              "Average Yield (Kg/Ha)",
              "Average Cultivation Area (Ha)",
            ])}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
