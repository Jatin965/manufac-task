import React, { useState, useEffect } from "react";
import { Table } from "@mantine/core";
import "./App.css";
import data from "./assets/data/Manufac_India_Agro_Dataset.json";

interface CropData {
  Country: string;
  Year: string;
  "Crop Name": string;
  "Crop Production (UOM:t(Tonnes))": string;
  "Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))": string;
  "Area Under Cultivation (UOM:Ha(Hectares))": string;
}

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
  const [table1, setTable1] = useState<Table1Row[]>([]);
  const [table2, setTable2] = useState<Table2Row[]>([]);

  useEffect(() => {
    const processedData = processData(data as CropData[]);
    setTable1(processedData.table1);
    setTable2(processedData.table2);
  }, []);

  const processData = (
    data: CropData[]
  ): { table1: Table1Row[]; table2: Table2Row[] } => {
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

    data.forEach((entry) => {
      const year = entry["Year"].split(", ")[1];
      const crop = entry["Crop Name"];
      const production = parseFloat(entry["Crop Production (UOM:t(Tonnes))"]) || 0;
      const yieldOfCrops =
        parseFloat(entry["Yield Of Crops (UOM:Kg/Ha(KilogramperHectare))"]) || 0;
      const areaUnderCultivation =
        parseFloat(entry["Area Under Cultivation (UOM:Ha(Hectares))"]) || 0;

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

    const table1: Table1Row[] = [];
    yearMap.forEach((value, key) => {
      table1.push({ year: key, maxCrop: value.maxCrop, minCrop: value.minCrop });
    });

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

  const renderTable = (data: (Table1Row | Table2Row)[], headers: string[]) => (
    <Table>
      <thead>
        <tr>
          {headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div>
      <h1>Table 1: Crop Production Analysis by Year</h1>
      {renderTable(table1, [
        "Year",
        "Crop with Maximum Production",
        "Crop with Minimum Production",
      ])}
      <h1>Table 2: Average Yield and Cultivation Area of Crops (1950-2020)</h1>
      {renderTable(table2, [
        "Crop",
        "Average Yield (Kg/Ha)",
        "Average Cultivation Area (Ha)",
      ])}
    </div>
  );
};

export default App;
