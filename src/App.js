import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, map, Renderer } from "leaflet"; 
import { FormControl, MenuItem, Select, TextField, Button } from "@material-ui/core";
import axios from "axios";
import './App.css';
import { CSVLink, CSVDownload } from "react-csv";;

export default function App() {
  const [apidata, setData] = useState([40.7128, -74.0060]);
  const [func, setFunc] = useState('Function_1A');
  const [borough, setBorough] = useState('Brooklyn');
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [locate, setLocate] = useState("");
  const [csvData, setCsvData] = useState([]);
  const mapRef = useRef();


  useEffect(() =>{
    
    const getData = async () =>{
      await axios.get(`https://geoservice.planning.nyc.gov/geoservice/geoservice.svc/${func}?Borough=${borough.toLowerCase()}&AddressNo=${address}&StreetName=${street}&Key=EAsAqrnWzxrjpbht`)
      .then((response) => response['data']['display'])
      .then((data) => {
        console.log(data);
        setData([data['out_lat_property'], data['out_lon_property']]);
        console.log(apidata);
      });
    };
    getData();
  }, [locate]);
  
  const onFuncChange = async (event) => {
    const funcCode = event.target.value;
    setFunc(funcCode);
  }

  const onBoroughChange = async (event) => {
    const boroughCode = event.target.value;
    setBorough(boroughCode);
  }

  const onAddressChange = async (event) => {
    const addressCode = event.target.value;
    setAddress(addressCode);
  }

  const onStreetChange = async (event) => {
    const streetCode = event.target.value;
    setStreet(streetCode.toLowerCase());
  }

  const onLocateChange = () => {
    setLocate(`${func}${borough}${address}${street}`);
  }

  async function fileUpload(){
    let csvData = [];
    let [fileHandle] = await window.showOpenFilePicker();
    let fileDate = await fileHandle.getFile();
    let text = await fileDate.text();
    let lines = text.split('\n').slice(1, -1);
    for(let i=0; i<lines.length;i++){
      let line = lines[i].split(',');
      var fc = line[0].trim(); 
      var borough1 = line[1].trim();
      var address1 = line[2].trim();
      var street1 = line[3].trim();
      await axios.get(`https://geoservice.planning.nyc.gov/geoservice/geoservice.svc/Function_1A?Borough=${borough1.toLowerCase()}&AddressNo=${address1}&StreetName=${street1}&Key=EAsAqrnWzxrjpbht`)
      .then((response) => response['data']['display'])
      .then((data) => {
        csvData.push({"lat": data['out_lat_property'], "lon": data['out_lon_property'].trim()});
      });
    }
    setCsvData(csvData);
  }

  return (              
      <div className="app">
        <div className="app_header">
          <h1>Geocoding Application</h1>
        </div>
        <div className="app_body">
          <MapContainer ref={mapRef} className="map" center={[40.7128, -74.0060]} zoom={11} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!isNaN(parseFloat(apidata[0])) && <Marker key="bwy" position={[parseFloat(apidata[0]), parseFloat(apidata[1])]}><Popup>lat: {apidata[0]}<br/>lon: {apidata[1]}</Popup></Marker> }
          </MapContainer>

          <div className="RightSelect">
            <div className="col_1">
            <div className="function_menu">
              <h2>Function</h2>
              <FormControl className="function__dropdown">
                <Select
                  variant="outlined"
                  value={func}
                  onChange={onFuncChange}
                >
                  <MenuItem value="Function_1A">Function_1A</MenuItem>
                  <MenuItem value="Function_1B">Function_1B</MenuItem>
                  <MenuItem value="Function_1E">Function_1E</MenuItem>
                  <MenuItem value="Function_AP">Function_AP</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className ="Borough_menu">
              <h2>Borough</h2>
              <FormControl className="borough__dropdown">
                <Select
                  variant="outlined"
                  value={borough}
                  onChange={onBoroughChange}
                >
                  <MenuItem value="Brooklyn">Brooklyn</MenuItem>
                  <MenuItem value="Manhattan">Manhattan</MenuItem>
                  <MenuItem value="Queens">Queens</MenuItem>
                  <MenuItem value="Bronx">Bronx</MenuItem>
                  <MenuItem value="Staten Island">Staten Island</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="Address">
              <h2>Address No.</h2>
              <TextField id="outlined-basic" value={address} variant="outlined" onChange={onAddressChange} />
            </div>
            <div className="Street">
              <h2>Street</h2>
              <TextField id="outlined-basic" value={street} variant="outlined" onChange={onStreetChange} />
            </div>
            <Button variant="contained" onClick={onLocateChange}>Locate</Button>
            </div>
            <div className="up_dwd">
              <h2>Upload Csv file</h2>
              <Button onClick={fileUpload}>Upload</Button>
              <h2>Download Csv file</h2>
              <CSVLink className="dwd" data={csvData} filename="lat_lon">Download</CSVLink>
            </div>
          </div>
        </div>
      </div>
  );
}

