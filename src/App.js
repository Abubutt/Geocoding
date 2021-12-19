import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, map, Renderer } from "leaflet"; 
import { FormControl, MenuItem, Select, TextField, Button } from "@material-ui/core";
import axios from "axios";
import './App.css';
import { CSVLink, CSVDownload } from "react-csv";
import { fs } from "fs";

export default function App() {
  const [apidata, setData] = useState([40.7128, -74.0060]);
  const [func, setFunc] = useState('Function_1A');
  const [borough, setBorough] = useState('Brooklyn');
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [locate, setLocate] = useState("");
  const [csvData, setCsvData] = useState([]);
  const [jsonData, setJsonData] = useState([]);

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
    let Jdata = {"data": []};
    let boroughs = {"manhattan": 1, "bronx": 2, "brooklyn": 3, "queens": 4, "staten island": 5};
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
      await axios.get(`https://geoservice.planning.nyc.gov/geoservice/geoservice.svc/Function_1B?Borough=${borough1.toLowerCase()}&AddressNo=${address1.toLowerCase()}&StreetName=${street1.toLowerCase()}&Key=EAsAqrnWzxrjpbht`)
      .then((response) => response['data']['display'])
      .then((data) => {
        Jdata["data"].push({"borough": borough1, "addressNo": address1, "street": street1, "lat": data["out_lat_property"], "lon": data["out_lon_property"], "out_x_coord_property": data["out_x_coord_property"], "out_y_coord_property": data["out_y_coord_property"], "Cross Streets": {"From Street": data["LowB7SCList"][0]["streetName"].trim(), "To Street": data["HighB7SCList"][0]["streetName"].trim()}, "Segment ID": data["out_segment_id"], "BBL": data["out_bbl"], "Blockface ID": data["out_blockface_id"], "Political Districts": {"Borough": data["out_boro_name1"], "Community District": data["out_cd"], "NYS Assembly District": data["out_ad"], "Neighborhood Tabulation Area": data["out_nta_2020"], "Community Tabulation Area": data["out_cdta_2020"]}});
        console.log(data);
      });
    }
    setJsonData(Jdata);
  }

  return (              
      <div className="app">
        <div className="app_header">
          <h1>Geocoding Application</h1>
        </div>
        <div className="app_body">
          <MapContainer className="map" center={[40.7128, -74.0060]} zoom={11} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!isNaN(parseFloat(apidata[0])) && <Marker key="bwy" position={[parseFloat(apidata[0]), parseFloat(apidata[1])]}><Popup><h3>{address} {street} {borough}, NY</h3>lat: {apidata[0]}<br/>lon: {apidata[1]}</Popup></Marker> }
          </MapContainer>
          <div className="LeftSelect">
            <div className="col_1">
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
                <div className="up">
                  <h2>Upload Csv file</h2>
                  <Button onClick={fileUpload}>Upload</Button>
                </div>
                <div className="dwd">
                  <h2>Download Json file</h2>
                  <a
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify(jsonData)
                    )}`}
                    download="data.json"
                  >
                    {`Download Json`}
                  </a>
                </div>
                <div className="legend">
                  <h2>Geocoding Application Info</h2><br/>
                  <p>If you would like to display a point on the map you can select the borough and enter the address in the designated areas.</p><br/>
                  <p>If you would like to upload a csv with addresses click the upload csv button. Once clicked you can download a json file containing the corresponding info of each address but clicking the download json button </p><br/>
                  <h3>CSV format should be: func, borough, addressNo, street</h3><br/>
                  <h3>Json file will include:</h3><br/>
                  <p>a.Latitude (usually around 40 to 41 degrees North)</p><br/><p>b.Longitude (usually around 72 degrees West (usually expressed as -72)</p><br/><p>c.XY (northing and easting for NY State Plane for Long Island, and its usually a long list of numbers)</p><br/><p>d.Street it is located on (“OnStreet”)</p><br/><p>e.The cross streets (the “FromStreet” and the “ToStreet”)</p><br/><p>f.The Segment ID of the OnStreetg.The BBL (stands for Borough, Block and Lot)</p><br/><p>h.The Blockface (if available)</p><br/><p>i.The political districts (Borough, City Council (CC), Community District (CD), NYS Assembly District (AD), NYS Senate District (SS), Congressional District (CG), Neighborhood Tabulation Area (NTA) 2020, Community Tabulation Area (CTA) 2020</p>
                </div>
            </div>
          </div>
        </div>
      </div>
  );
}

