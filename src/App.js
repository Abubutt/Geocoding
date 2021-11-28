import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from "leaflet"; 
import { FormControl, MenuItem, Select, TextField, Button } from "@material-ui/core";
import axios from "axios";
import './App.css';

export default function App() {
  const [apidata, setData] = useState([40.7128, -74.0060]);
  const [func, setFunc] = useState('Function_1A');
  const [borough, setBorough] = useState('Brooklyn');
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [locate, setLocate] = useState("");

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

  return (              
      <div className="app">
        <div className="app_header">
          <h1>Geocoding Application</h1>
        </div>
        <div className="app_body">
          <MapContainer className="map" center={[40.7128, -74.0060]} zoom={12} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {!isNaN(parseFloat(apidata[0])) && <Marker key="bwy" position={[parseFloat(apidata[0]), parseFloat(apidata[1])]}></Marker> }
          </MapContainer>

          <div className="RightSelect">
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
        </div>
      </div>
  );
}

