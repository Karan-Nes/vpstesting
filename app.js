require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const axios = require("axios");
const lookup = require("country-code-lookup");
app.use(bodyParser.json());
let accessToken = ""; 

async function refreshAccessToken() {
  try {
    const url = "https://accounts.zoho.com/oauth/v2/token";
    const params = new URLSearchParams({
      refresh_token:
        "1000.a4e41290ceb76e63530b4939494822c8.547e7fac8e38a9b0769282dd57439e72",
      client_id: "1000.Z1DCGPJE2Q1I439DDEWPTPIMUCENSZ",
      client_secret: "b4de458d929ac86cc9034df576637584b38e1338fd",
      grant_type: "refresh_token",
    });

    const response = await axios.post(url, params);

    if (response.status !== 200) {
      throw new Error("Failed to refresh access token");
    }

    accessToken = response.data.access_token; // Update the access token
    console.log("Access token refreshed successfully:", accessToken);
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    // Handle error (e.g., retry logic)
  }
}

refreshAccessToken();

setInterval(refreshAccessToken, 30 * 60 * 1000); // 45 minutes in milliseconds

function injectAccessToken(req, res, next) {
  req.accessToken = accessToken; // Attach accessToken to the request object
  next();
}
app.post("/indiamart/6dE-IpuZieAd7X5OjWVAjErINbxsqtpw", injectAccessToken,async (req, res) => {
  const testdata = req.body;
  console.log("Data Received from indiamart " + testdata);
  const Company = testdata.RESPONSE.SENDER_COMPANY || "";
  const Last_Name = testdata.RESPONSE.SENDER_NAME || "";
  const Mobile = testdata.RESPONSE.SENDER_MOBILE || "";
  const Lead_Source = "IndiaMart";
  const Email = testdata.RESPONSE.SENDER_EMAIL || "";
  const Street = testdata.RESPONSE.SENDER_ADDRESS || "";
  const City = testdata.RESPONSE.SENDER_CITY || "";
  const State = testdata.RESPONSE.SENDER_STATE || "";
  const Zip_Code = testdata.RESPONSE.SENDER_PINCODE || "";

  const Country =
    lookup.byIso(testdata.RESPONSE.SENDER_COUNTRY_ISO).country || "";
  const Mobile_2 = testdata.RESPONSE.SENDER_MOBILE_ALT || "";
  const Subject = testdata.RESPONSE.SUBJECT || "";
  const Enquiry_Message =
    testdata.RESPONSE.SENDER_EMAIL_ALT +
      "<br/>" +
      testdata.RESPONSE.SENDER_PHONE +
      "<br/>" +
      testdata.RESPONSE.SENDER_PHONE_ALT +
      "<br/>" +
      testdata.RESPONSE.QUERY_PRODUCT_NAME +
      "<br/>" +
      testdata.RESPONSE.QUERY_MESSAGE || "";
  const newdata = {
    Company,
    Last_Name,
    Mobile,
    Lead_Source,
    Email,
    Street,
    City,
    State,
    Zip_Code,
    Mobile_2,
    Subject,
    Enquiry_Message,
    Country,
  };
  console.log("Starting Lead creation with data "+newdata);
  try {
    const url = "https://www.zohoapis.com/crm/v2/Leads";
    const response = await axios.post(
      url,
      { data: [newdata] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Lead created successfully with reponse " + response);
    res.status(200).send({
      code: 200,
      status: "Success",
    });
  } catch (error) {
    res.status(500).send({
      code: 500,
      status: "Internal Server Error",
      error: error.message,
    });
    console.log("Lead Did not Created")
  }
});
app.get("/", (req, res) => {
  res.send("Hi");
});
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});