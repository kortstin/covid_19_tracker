import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  FormControl, 
  MenuItem, 
  Select } from '@material-ui/core';
import InfoBox from "./components/InfoBox"
import Map from "./components/Map"
import Table from "./components/Table.jsx"
import { prettyPrintStat, sortData } from './utils'
import LineGraph from './components/LineGraph';
import numeral from "numeral";
import './App.css';
import "leaflet/dist/leaflet.css";
import Footer from './components/Footer';
import InfoSection from './components/InfoSection'
import { homeObjOne,homeObjTwo, homeObjThree} from './Data'



const baseUrl = "https://disease.sh"

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(['Worldwide'])
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch(`${baseUrl}/v3/covid-19/all`)
    .then(response => response.json ())
    .then(data => {
      setCountryInfo(data);
    })

  }, [])


  useEffect(() => {
    const getCountriesData = async () => {
      await fetch(`${baseUrl}/v3/covid-19/countries`)
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country, 
            value: country.countryInfo.iso3 
          }))

          const sortedData = sortData(data);

          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
      })
    }
    getCountriesData();
  }, []);

  const handleCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = 
    countryCode === 'Worldwide' 
      ? `${baseUrl}/v3/covid-19/all`
      : `${baseUrl}/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setMapZoom(4);setCountryInfo(data);

      countryCode === "Worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        countryCode === "worldwide" ? setMapZoom(3) : setMapZoom(4);

    })
  }

  // console.log('Country info >>', countryInfo);

  return (

    <div className="outer__container">
    <div className="app">


      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={handleCountryChange}>
            <MenuItem value="Worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
            onClick={(e) => setCasesType("cases")}
            title="Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")} 
            />
          <InfoBox 
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
            />
          <InfoBox 
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
            />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
        </div>


      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new cases</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>

      </Card>


    </div>


    
    <div className="info">

    <InfoSection
       {...homeObjOne}
       />

    <InfoSection 
        {...homeObjTwo}
       />

    <InfoSection 
        {...homeObjThree}
       /> 

    </div>
    
    
    <div className="footer">
        <Footer />
    </div>

    </div>
      
 );
}

export default App;
