import axios from "axios";
import {
  Input,
  ChakraProvider,
  theme,
  Stack,
  Box,
  Heading,
  Flex,
  Text,
  Center,
  Square,
  Button,
  HStack,
  IconButton,
  GridItem,
  Grid,
} from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { FaLocationArrow, FaTimes } from "react-icons/fa";
import Map from "./map";

export default function Home() {
  const baseUrl = 'https://commutilator-api.herokuapp.com'
  const originRef = useRef();
  const destinationRef = useRef();
  const yearsArray = [
    2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009,
    2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001, 2000, 1999, 1998, 1997,
    1996, 1995, 1994, 1993, 1992, 1991,
  ];
  const workDays = [1, 2, 3, 4, 5, 6, 7];
  // const [mpgInput, setMpgInput] = useState(null);
  const [selectYear, setSelectYear] = useState(2020);
  const [carMakes, setCarMakes] = useState([]);
  const [carMakeID, setCarMakeID] = useState("1");
  const [workDay, setWorkDay] = useState(1);
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [carModels, setCarModels] = useState([]);
  const [carTrimID, setCarTrimID] = useState("");
  const [combinedMPGVal, setCombinedMPGVal] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [directionsResponse, setDirectionsResponse] = useState(null);

  async function calculateRoute() {
    console.log("orirint", originRef);
    if (originRef.current.value === "" || destinationRef.current.value === "") {
      return;
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
  }

  useEffect(() => {
    axios
      .get("https://fathomless-mountain-86819.herokuapp.com/getmakes")
      .then((res) => {
        console.log("res", res);
        setCarMakes(res.data);
      });
  }, []);

  useEffect(() => {
    if (selectYear && carMakeID) {
      axios
        .get(
          `https://fathomless-mountain-86819.herokuapp.com/getvehiclemodels?year=${selectYear}&makeid=${carMakeID}`
        )
        .then((res) => {
          console.log("models", res);
          if (res.data.length === 0) {
            setCombinedMPGVal(0);
          }
          setCarModels(res.data);
        });
    }
  }, [selectYear, carMakeID]);

  useEffect(() => {
    if (selectYear && carTrimID) {
      axios
        .get(
          `https://fathomless-mountain-86819.herokuapp.com/getvehiclespec?year=${selectYear}&trimid=${carTrimID}`
        )
        .then((res) => {
          const mpgValueData = res.data.CombinedMpg;

          if (mpgValueData) {
            console.log("ok calcualtion");
            const roundedMPGVal = (
              Math.round(mpgValueData * 100) / 100
            ).toFixed(1);

            setCombinedMPGVal(roundedMPGVal); // => 0.0
          } else {
            setCombinedMPGVal(0.0);
          }
        });
    }
  }, [selectYear, carTrimID]);

  const splitAddress = (addressText) => {
    const addressArray = addressText.split(",");
    let city = ''
    if (addressArray.length === 3) {
      city = addressArray[0]
    } else if (addressArray.length === 4) {
      city = addressArray[1]
    } else if (addressArray.length === 5) {
      city = addressArray[2]
    }
    return city.trim()
  }

  const commutePostData = async () => {

    let cityStart = splitAddress(originRef.current.value)
    let cityEnd = splitAddress(destinationRef.current.value)
    console.log('home.calculateRoute().cityStart', cityStart)
    console.log('home.calculateRoute().cityEnd', cityEnd)

    const startAvgGasLocation = await axios
      .get(`https://fathomless-mountain-86819.herokuapp.com/getgasprice?search=${cityStart}`)

    const endAvgGasLocation = await axios
      .get(`https://fathomless-mountain-86819.herokuapp.com/getgasprice?search=${cityEnd}`)

    // console.log('start gas location', startAvgGasLocation, 'end gas location', endAvgGasLocation)

    const startGas = startAvgGasLocation.data.locationAverage

    const endGas = endAvgGasLocation.data.locationAverage

    const avgGasLocation = (startGas + endGas) / 2

    // const response = await axios.post(`${baseUrl}/commute/`,
    //   {
    //     start_location: cityStart,
    //     end_location: cityEnd,
    //     days_per_week_commuting: workDay,
    //     distance: distance,
    //     avg_gas_commute: avgGasLocation
    //   })
    // console.log('commute Post Data Response', response)
  }

  const handleAskQuestion = (event) => {
    event.preventDefault();
    calculateRoute();
    commutePostData()

    // axios
    //   .post(`commute data`,
    //     {
    //       start_location: { startPoint },
    //       end_location: { endPoint },
    //       days_per_week_commuting: { workDay },
    //       distance: { distance },
    //       avg_gas_commute: 3.76
    //     })
    //   .post(`vehicle data`,
    //     {
    //       mpg: { combinedMPGVal }
    //     })
    //   // .post(`calculation data`,
    //   //   {
    //   //     "commute": 3,
    //   //     "vehicle": 2
    //   //   })
    //   .then((res) => {
    //     // Show Results?
    //   })

    // console.log('starting point:', startPoint)
    // console.log('ending point:', endPoint)
    //     console.log("year:", selectYear);
    //     console.log("car make id:", carMakeID);
    //     console.log("car trim id:", carTrimID);
    // console.log('mpg input:', mpgInput)
    //     console.log("work day:", workDay);
  };

  return (
    <ChakraProvider them={theme}>
      <Flex
        position="relative"
        flexDirection="column"
        alignItems="center"
        // h="100vh"
        w="100vw"
      >
        <div>
          <form onSubmit={handleAskQuestion}>
            <div>
              <label htmlFor="starting-location-field">
                Starting Location:{" "}
              </label>
              <Autocomplete>
                <Input type="text" placeholder="Origin" ref={originRef} />
              </Autocomplete>
            </div>
            <br />
            <br></br>
            <br></br>

            <div>
              <label htmlFor="ending-location-field">Ending Location: </label>
              <Autocomplete>
                <Input
                  type="text"
                  placeholder="Destination"
                  ref={destinationRef}
                />
              </Autocomplete>
            </div>
            <br />
            <br></br>
            <br></br>
            <div>
              <label htmlFor="work-days-field">Working Days: </label>
              <select
                id="work-days-field"
                // value={dropItem}
                onChange={(e) => setWorkDay(e.target.value)}
              >
                {workDays.map((dayz, index) => (
                  <option key={index} value={dayz}>
                    {dayz}
                  </option>
                ))}
              </select>
              <br></br>
              <br></br>
            </div>
            <br />

            <div>
              <label htmlFor="year-field">Year: </label>
              <select
                id="year-field"
                // value={dropItem
                onChange={(e) => setSelectYear(e.target.value)}
              >
                {yearsArray.map((yearz, index) => (
                  <option key={index} value={yearz}>
                    {yearz}
                  </option>
                ))}
              </select>
            </div>
            <br />
            <div>
              <label htmlFor="car-make-field">Car Make: </label>
              <select
                id="car-make-field"
                onChange={(e) => setCarMakeID(e.target.value)}
              >
                {carMakes.map((makez, index) => (
                  <option key={index} value={makez.Id}>
                    {makez.Name}
                  </option>
                ))}
              </select>
            </div>
            <br />

            <div>
              <label htmlFor="car-model-field">Car Model: </label>

              <select
                id="car-model-field"
                onChange={(e) => setCarTrimID(e.target.value)}
              >
                {carModels.length > 0 ? (
                  carModels.map((modelz, index) => (
                    <option key={index} value={modelz.TrimId}>
                      {modelz.ModelName} {modelz.TrimName}
                    </option>
                  ))
                ) : (
                  <option>No models found</option>
                )}
              </select>
            </div>
            <br />
            <br></br>
            <br></br>
            <div>
              {console.log(
                "combined mpg val",
                combinedMPGVal,
                carModels.length
              )}
              {carModels.length === 0 ? (
                <p>No models found, please enter MPG</p>
              ) : combinedMPGVal === 0.0 ? (
                <p>No MPG found, please enter MPG</p>
              ) : (
                ""
              )}
              {/* {combinedMPGVal === 0.0 && <p>No MPG found, please enter MPG</p>} */}
              <label htmlFor="mpg-input-field">Input MPG: </label>
              <input
                id="mpg-input-field"
                type="text"
                value={combinedMPGVal}
                onChange={(e) => setCombinedMPGVal(e.target.value)}
                required
              />
            </div>
            <br />

            <div>
              <HStack spacing={4} mt={4} justifyContent="space-between">
                <Button colorScheme="blue" type="submit">
                  Commutilate Route
                </Button>
                <Text>Distance: {distance} </Text>
                <Text>Duration: {duration} </Text>
              </HStack>
              {/* <input type="submit" value="Commutilate Route" /> */}
              <br></br>
              <br></br>
              <br></br>
            </div>
          </form>
        </div>
      </Flex>
      <div className="map-container">
        <Grid templateColumns="repeat(5, 1fr)" gap={4}>
          <GridItem colSpan={2}>
            <Map
              distance={distance}
              duration={duration}
              directionsResponse={directionsResponse}
              originRef={originRef}
              destinationRef={destinationRef}
            />
          </GridItem>
          <GridItem colStart={4} colEnd={6}>
            Result Box
          </GridItem>
        </Grid>
      </div>
    </ChakraProvider>
  );
}
