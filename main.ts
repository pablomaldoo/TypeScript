import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";


// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0"
});




// Async tool with external API call
server.registerTool(
  "fetch-weather",
  {
    title: "Weather Fetcher", // Descriptive title for the UI
    description: "Get weather data for a city", // Tool description
    inputSchema: { city: z.string() } // Input schema: expects a string called city
  },
  async ({ city }) => { // Async function that receives the city parameter
    // 1. Get lat/lon of the city using Nominatim
    let lat = null; // Initialize latitude as null
    let lon = null; // Initialize longitude as null
    let weatherText = ""; // Initialize the response text
    try {
      // Call the Nominatim API to search for the city and get lat/lon
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`); // Call the geolocation API
      const geoData = await geoRes.json(); // Convert the response to JSON
      if (geoData && geoData.length > 0) { // If results found
        lat = geoData[0].lat; // Take the latitude from the first result
        lon = geoData[0].lon; // Take the longitude from the first result
        // 2. Call Open-Meteo with those coordinates
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url); // Call the weather API
        const data = await response.json(); // Convert the response to JSON
        weatherText = `Weather in ${city}: ${JSON.stringify(data.current_weather)}`; // Convert the weather data to string

      } else {
        weatherText = `Could not find coordinates for ${city}.`; // If the city was not found
      }
    } catch (e) {
      weatherText = `Error fetching weather for ${city}.`; // If there was an error in the request
    }
    // Return the result in the format expected by MCP
    return {
      content: [{ type: "text", text: weatherText }] // Return the weather text and coordinates
    };
  }
);


// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);