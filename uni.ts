import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "uni-mcp",
    version: "1.0.0"
});


// Register a tool to fetch university details  
server.registerTool(
    "fetch-university",
    {
        title: "University Fetcher",
        description: "Get details about a university",
        inputSchema: { name: z.string() }
    },
    async ({ name }) => {
        // Use University API to search for universities by country
        const response = await fetch(`http://universities.hipolabs.com/search?country=${name}`);
        const data = await response.json();
        // Get only the first 5 universities
        let text = `Universities found: ${JSON.stringify(data[0])}`;
        return {
            content: [{ type: "text", text }]
        };
    }
);

// Start the server with stdin/stdout transport
const transport = new StdioServerTransport();
await server.connect(transport);